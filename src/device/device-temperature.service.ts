import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { Temperature } from './entities/temperature.entity';
import { TemperaturePacketDto } from './dto/temperature-packet.dto';
import { TemperatureRepository } from './repositories/temperature.repository';
import { Interval } from '@nestjs/schedule';
import { DeviceService } from './device.service';
import { SlaveRepository } from './repositories/slave.repository';
import { ITemperatureConfig } from './interfaces/slave-configs';
import { createQueryBuilder } from 'typeorm';
import { DoubleKeysMap } from '../util/double-keys-map';
import { Cache } from 'cache-manager';
import { LedPacketDto } from './dto/led-packet.dto';
import { SlaveConfigDto } from '../api/dto/slave/slave-config.dto';
import { ESlaveConfigTopic } from '../util/constants/api-topic';

@Injectable()
export class DeviceTemperatureService {
  /** Todo: Redis로 걷어내면 제거 */
  public readonly currentTemperatures: DoubleKeysMap;

  constructor(
    @Inject(MQTT_BROKER) private readonly mqttBroker: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly temperatureRepository: TemperatureRepository,
    private readonly deviceService: DeviceService,
    private readonly slaveRepository: SlaveRepository,
  ) {
    this.currentTemperatures = new DoubleKeysMap();
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
      /**
       * Todo: Extract create key function */
      const key = `temperature/${masterId}/${slaveId}`;
      return this.cacheManager.get<number>(key);
    } catch (e) {
      throw e;
    }
    /* get cached temperature */
    // return this.currentTemperatures.get([masterId, slaveId]);
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

  /**
   * Todo: 이상 온도 감지하면 발생하는 트리거
   *       추후 문자나 푸시 등 사용자에게 알림 기능 추가
   *       지금은 임시로 마스터 보드의 LED를 1초정도 켰다 끔 */
  mockOverRangeTrigger(masterId: number) {
    console.log(`온도 범위 값 초과`);
    const topic = `master/${masterId}/temperature`;

    const mockLedMessage = new LedPacketDto(
      0x23,
      0x21,
      0xff,
      0xd1,
      0x01,
      0x20,
      0x09,
      [0xe1],
    );

    console.log(`send mock led message: `, mockLedMessage);

    return this.deviceService.publishEvent(
      topic,
      JSON.stringify(mockLedMessage),
    );
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
