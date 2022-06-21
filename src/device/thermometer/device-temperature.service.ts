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
import { SensorConfigKey, SensorStateKey } from '../../util/key-generator';
import { map } from 'rxjs';
import { Between, createQueryBuilder } from 'typeorm';
import { subDays, addDays } from 'date-fns';

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
  saveTemp(temp: Temperature) {
    return this.temperatureRepository
      .createQueryBuilder()
      .insert()
      .into(Temperature)
      .values(temp)
      .execute();
  }

  async saveTemperature(temperature: Temperature) {
    try {
      const saveResult = await this.temperatureRepository.saveTemperature(
        temperature,
      );

      await this.cacheTemperature(temperature);

      return saveResult;
    } catch (e) {
      throw e;
    }
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

  fetchTemperatureOneDay(
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
      .orderBy('create_at', 'ASC')
      .getRawMany();
  }

  async fetchTemperature(masterId: number, slaveId: number) {
    try {
      const result = await this.temperatureRepository.fetchTemperatureLastWeek(
        masterId,
        slaveId,
      );

      return result;
    } catch (e) {
      console.log(e);
    }
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
      console.log(`Cache Hit!`, cachedRange);
      return cachedRange;
    }

    const configs = await this.slaveRepository.getConfigs(masterId, slaveId);
    /** Todo: Exception handling */
    const range = [
      configs?.startTemperatureRange,
      configs?.endTemperatureRange,
    ];

    await this.cacheManager.set<number[]>(key, range, { ttl: 3600 });
    console.log(`cached Range: `, range);
    return range;
  }
}
