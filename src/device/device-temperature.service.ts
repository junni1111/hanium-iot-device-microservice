import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { Temperature } from './entities/temperature.entity';
import { TemperatureRepository } from './repositories/temperature.repository';
import { DeviceService } from './device.service';
import { SlaveRepository } from './repositories/slave.repository';
import { ITemperatureConfig } from './interfaces/slave-configs';
import { Cache } from 'cache-manager';
import { SlaveConfigDto } from '../api/dto/slave/slave-config.dto';
import { ESlaveConfigTopic } from '../util/constants/api-topic';

@Injectable()
export class DeviceTemperatureService {
  constructor(
    @Inject(MQTT_BROKER) private readonly mqttBroker: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly temperatureRepository: TemperatureRepository,
    private readonly deviceService: DeviceService,
    private readonly slaveRepository: SlaveRepository,
  ) {}

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
      /**
       * Todo: Extract create key function */
      const key = `temperature/${masterId}/${slaveId}`;
      return this.cacheManager.get<number>(key);
    } catch (e) {
      throw e;
    }
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
    /**
     * Todo: Extract Create Key Function */
    const key = `temperature/${masterId}/${slaveId}`;
    return this.cacheManager.set<number>(key, temperature, { ttl: 60 });
  }

  async getTemperatureRange(
    masterId: number,
    slaveId: number,
  ): Promise<number[]> {
    const key = `master/${masterId}/slave/${slaveId}/${ESlaveConfigTopic.TEMPERATURE}`;
    const cachedRange = await this.cacheManager.get<number[]>(key);

    if (cachedRange) {
      console.log(`Cache Hit!`, cachedRange);
      return cachedRange;
    }

    /**
     * Todo: DB에서 온도 범위 조회 */
    console.log(`Search DB`);
    const configs = await this.slaveRepository.getConfigs(masterId, slaveId);

    return [configs?.startTemperatureRange, configs?.endTemperatureRange];
  }
}
