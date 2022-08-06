import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { SlaveRepository } from '../slave/slave.repository';
import { Cache } from 'cache-manager';
import { ESlaveConfigTopic, ESlaveState } from '../../util/constants/api-topic';
import {
  GenerateAverageKeys,
  GenerateDayAverageKey,
  SensorConfigKey,
  SensorStateKey,
} from '../../util/key-generator';
import { TemperatureRepository } from '../repositories/device-temperature.repository';
import { ThermometerRepository } from '../repositories/thermometer.repository';
import { GraphPoint } from '../interfaces/graph-config';
import { TemperatureConfigDto } from '../../api/thermometer/dto/temperature-config.dto';

@Injectable()
export class DeviceTemperatureService {
  constructor(
    @Inject(MQTT_BROKER) private mqttBroker: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private slaveRepository: SlaveRepository,
    private thermometerRepository: ThermometerRepository,
    private temperatureRepository: TemperatureRepository,
  ) {}

  /** Todo: Custom Repository 제거하고
   *        이 함수에 온도 저장 로직 설정 */
  insertTemperature(
    masterId: number,
    slaveId: number,
    temperature: number,
    createAt?: Date,
  ) {
    return this.temperatureRepository.createLog(
      masterId,
      slaveId,
      temperature,
      createAt,
    );
  }

  getAverage(masterId: number, slaveId: number, begin: Date, end: Date) {
    return this.temperatureRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.slave', 'slave')
      .select('AVG(t.temperature)', 'average')
      .where(`slave.masterId = :masterId`, { masterId })
      .andWhere(`slave.slaveId = :slaveId`, { slaveId })
      .andWhere(`t.create_at BETWEEN :begin AND :end`, {
        begin,
        end,
      })
      .getRawOne();
  }

  saveTemperature(masterId: number, slaveId: number, temperature, date: Date) {
    try {
      return Promise.allSettled([
        this.insertTemperature(masterId, slaveId, temperature),
        this.cacheTemperature(masterId, slaveId, temperature),
        this.cacheDayAverage(masterId, slaveId, temperature, date),
      ]);
    } catch (e) {
      throw e;
    }
  }

  private async cacheDayAverage(
    masterId: number,
    slaveId: number,
    temperature: number,
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
    const average = this.updateAverage(temperature, prevAverage, averageCount);

    return this.cacheManager.set(
      dayAverageKey,
      [average, averageCount + 1],
      { ttl: 604800 }, // 1주일 -> 초
    );
  }

  getCachedTemperature(masterId: number, slaveId: number): Promise<number> {
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
    return this.temperatureRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.slave', 'slave')
      .select(['t.create_at AS x', 't.temperature AS y'])
      .where(`slave.masterId = :masterId`, { masterId })
      .andWhere(`slave.slaveId = :slaveId`, { slaveId })
      .andWhere(`t.create_at BETWEEN :begin AND :end`, {
        begin: beginDate,
        end: endDate,
      })
      .limit(100000) // Todo: 제한 고민
      .orderBy('t.create_at', 'ASC')
      .getRawMany();
  }

  /** Todo: Refactor */
  async setConfig(configDto: TemperatureConfigDto) {
    try {
      const { masterId, slaveId } = configDto;

      const slave = await this.slaveRepository.findOne({
        where: { masterId, slaveId },
      });

      if (!slave) {
        /** Todo: handle exception */
        return;
      }

      return this.thermometerRepository.updateConfig(slave, configDto);
    } catch (e) {
      console.log(e);
    }
  }

  cacheTemperature(masterId: number, slaveId: number, temperature) {
    const key = SensorStateKey({
      sensor: ESlaveState.TEMPERATURE,
      masterId,
      slaveId,
    });

    return this.cacheManager.set<number>(key, temperature, {
      ttl: 60,
    });
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

    const configs = await this.thermometerRepository.findBySlave(
      masterId,
      slaveId,
    );

    /** Todo: Exception handling */
    const range = [configs?.rangeBegin, configs?.rangeEnd];

    await this.cacheManager.set<number[]>(key, range, { ttl: 3600 });
    return range;
  }

  async getAveragePoints(
    masterId: number,
    slaveId: number,
    beginDate: Date,
    endDate: Date,
    addFunction: (date: Date | number, amount: number) => Date,
    timeAmount: number,
  ) {
    const keys = GenerateAverageKeys(
      masterId,
      slaveId,
      beginDate,
      endDate,
      addFunction,
      timeAmount,
    );
    const [min, max] = await this.getTemperatureRange(masterId, slaveId);
    const points: GraphPoint[] = [];

    await Promise.all(
      keys.map(async (key: string) => {
        const cached = await this.cacheManager.get<number[]>(key);
        const [, , , , year, month, day] = key.split('/');
        const dateString = `${year}/${month}/${day}`;

        if (!cached) {
          const begin = new Date(dateString);
          const end = addFunction(begin, timeAmount);
          const { average } = await this.getAverage(
            masterId,
            slaveId,
            begin,
            end,
          );

          if (!average) {
            return;
          }

          await this.cacheManager.set<number[]>(key, [average, 1], {
            ttl: 604800, // 1주일 -> 초
          });
          return points.push(new GraphPoint(dateString, average, min, max));
        }

        const [cachedAverage] = cached;
        return points.push(new GraphPoint(dateString, cachedAverage, min, max));
      }),
    );

    // 월 화 수 목 금 토 일
    return points.sort((a, b): number => (a.x < b.x ? -1 : 1));
  }

  private updateAverage(
    temperature: number,
    prevAverage: number,
    averageCount: number,
  ) {
    return (
      prevAverage * (averageCount / (averageCount + 1)) +
      temperature / (averageCount + 1)
    );
  }

  clearTemperatureDB(type: string) {
    switch (type) {
      case 'log':
        return this.temperatureRepository
          .createQueryBuilder()
          .delete()
          .execute();
      case 'config':
        return this.thermometerRepository
          .createQueryBuilder()
          .delete()
          .execute();
      default:
        return 'failed';
    }
  }
}
