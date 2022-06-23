import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { Temperature } from '../entities/temperature.entity';
import { TemperatureRepository } from '../repositories/temperature.repository';
import { DeviceService } from '../device.service';
import { SlaveRepository } from '../repositories/slave.repository';
import { ITemperatureConfig } from '../interfaces/slave-configs';
import { Cache } from 'cache-manager';
import { SlaveConfigDto } from '../../api/dto/slave/slave-config.dto';
import { ESlaveConfigTopic, ESlaveState } from '../../util/constants/api-topic';
import {
  GenerateDayAverageKey,
  GenerateTemperatureKeys,
  SensorConfigKey,
  SensorStateKey,
} from '../../util/key-generator';
import { createQueryBuilder } from 'typeorm';
import { IGraphConfig } from '../interfaces/graph-config';
import { addDays } from 'date-fns';

@Injectable()
export class DeviceTemperatureService {
  constructor(
    @Inject(MQTT_BROKER) private readonly mqttBroker: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly temperatureRepository: TemperatureRepository,
    private readonly deviceService: DeviceService,
    private readonly slaveRepository: SlaveRepository,
  ) {}

  /** Todo: Custom Repository 제거하고
   *        이 함수에 온도 저장 로직 설정 */
  insertTemperature(temperature: Temperature) {
    return this.temperatureRepository
      .createQueryBuilder()
      .insert()
      .into(Temperature)
      .values(temperature)
      .execute();
  }

  async saveTemperature(temperature: Temperature, date: Date) {
    try {
      return Promise.allSettled([
        this.insertTemperature(temperature),
        this.cacheTemperature(temperature),
        this.cacheDayAverage(temperature, date),
      ]);
    } catch (e) {
      throw e;
    }
  }

  private async cacheDayAverage(
    { masterId, slaveId, temperature }: Temperature,
    date: Date,
  ) {
    const dayAverageKey = GenerateDayAverageKey(masterId, slaveId, date);
    const averageInfo = await this.cacheManager.get<number[]>(dayAverageKey);

    if (!averageInfo) {
      return this.cacheManager.set(
        dayAverageKey,
        [temperature, 1],
        { ttl: 604800 }, // 1주일 -> 초
      );
    }

    const [prevAverage, averageCount] = averageInfo;
    const average = this.getAverage(temperature, prevAverage, averageCount);

    return this.cacheManager.set(
      dayAverageKey,
      [average, averageCount + 1],
      { ttl: 604800 }, // 1주일 -> 초
    );
  }

  async getCurrentTemperature(
    masterId: number,
    slaveId: number,
  ): Promise<number> {
    try {
      const key = SensorStateKey({
        sensor: ESlaveState.TEMPERATURE,
        masterId,
        slaveId,
      });
      return this.cacheManager.get<number>(key);
    } catch (e) {
      throw e;
    }
  }

  getTemperaturesBetweenDates(
    masterId: number,
    slaveId: number,
    beginDate: Date,
    endDate: Date,
  ) {
    return createQueryBuilder()
      .select(['create_at AS x', 'temperature AS y'])
      .where(`master_id = :masterId`, { masterId })
      .andWhere(`slave_id = :slaveId`, { slaveId })
      .andWhere(`create_at BETWEEN :begin AND :end`, {
        begin: beginDate,
        end: endDate,
      })
      .distinct(true)
      .from(Temperature, 'temperatures')
      .limit(100000) // Todo: 제한 고민
      .orderBy('create_at', 'ASC')
      .getRawMany();
  }

  async setTemperatureConfig({
    masterId,
    slaveId,
    startTemperatureRange,
    endTemperatureRange,
    temperatureUpdateCycle,
  }: Partial<SlaveConfigDto>) {
    try {
      const config: ITemperatureConfig = {
        startTemperatureRange,
        endTemperatureRange,
        temperatureUpdateCycle,
      };
      return this.slaveRepository.setConfig(masterId, slaveId, config);
    } catch (e) {
      console.log(e);
    }
  }

  async createTestData(masterId: number, slaveId: number) {
    return this.temperatureRepository.createTestData(masterId, slaveId);
  }

  async cacheTemperature({ masterId, slaveId, temperature }: Temperature) {
    const key = SensorStateKey({
      sensor: ESlaveState.TEMPERATURE,
      masterId,
      slaveId,
    });
    return this.cacheManager.set<number>(key, temperature, { ttl: 60 });
  }

  async getTemperatureRange(
    masterId: number,
    slaveId: number,
  ): Promise<number[]> {
    const key = SensorConfigKey({
      sensor: ESlaveConfigTopic.TEMPERATURE,
      masterId,
      slaveId,
    });
    const cachedRange = await this.cacheManager.get<number[]>(key);

    if (cachedRange) {
      return cachedRange;
    }

    const configs = await this.slaveRepository.getConfigs(masterId, slaveId);
    /** Todo: Exception handling */
    const range = [
      configs?.startTemperatureRange,
      configs?.endTemperatureRange,
    ];

    await this.cacheManager.set<number[]>(key, range, { ttl: 3600 });
    return range;
  }

  async getCachedTemperatures(
    masterId: number,
    slaveId: number,
    beginDate: Date,
    endDate: Date,
  ) {
    const keys = GenerateTemperatureKeys(
      masterId,
      slaveId,
      beginDate,
      endDate,
      addDays,
      1,
    );

    /**
     * Todo 연준: 생성된 키들 가지고 getWeekTemperatureCache 리팩토링 해보기*/
  }

  async getWeekTemperatureCache(key: string): Promise<IGraphConfig[]> {
    const startDate: Date = new Date(); // 일주일 전
    const endDate: Date = new Date(); // 오늘
    startDate.setDate(endDate.getDate() - 6);

    const [, , master_id, slave_id] = key.split('/');
    const configTemperature = await this.cacheManager.get(
      `config/temperature/${master_id}/${slave_id}`,
    );
    const keys: string[] = await this.cacheManager.store.keys<string[]>(key);
    const result: IGraphConfig[] = [];
    await Promise.all(
      keys.map(async (key: string): Promise<IGraphConfig> => {
        const value = await this.cacheManager.get(key);
        const [, , , , year, month, day] = key.split('/');
        const point: IGraphConfig = {
          x: `${year}/${month}/${day}`,
          y: value[0],
          etc:
            value[0] >= configTemperature[0] && value[0] <= configTemperature[1]
              ? 'stable'
              : 'unstable',
        };
        console.log(point, value);
        if (
          Number(year) >= startDate.getFullYear() &&
          Number(year) <= endDate.getFullYear() &&
          Number(month) >= startDate.getMonth() + 1 &&
          Number(month) <= endDate.getMonth() + 1 &&
          Number(day) >= startDate.getDate() &&
          Number(day) <= endDate.getDate()
        ) {
          result.push(point);
        } else {
          this.cacheManager.store.del(key);
        }
        return point;
      }),
    );
    return result.sort((a: IGraphConfig, b: IGraphConfig): number => {
      return a.x < b.x ? -1 : 1;
    });
  }

  private getAverage(
    target: number,
    prevAverage: number,
    averageCount: number,
  ) {
    return (
      prevAverage * (averageCount / (averageCount + 1)) +
      target / (averageCount + 1)
    );
  }
}
