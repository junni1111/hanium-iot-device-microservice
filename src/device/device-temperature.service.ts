import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { Temperature } from './entities/temperature.entity';
import { TemperaturePacketDto } from './dto/temperature-packet.dto';
import { TemperatureRepository } from './repositories/temperature.repository';
import { Interval } from '@nestjs/schedule';
import { DeviceService } from './device.service';
import { SlaveRepository } from './repositories/slave.repository';
import { SlaveConfigDto } from '../api/dto/slave-config.dto';
import { ITemperatureConfig } from './interfaces/slave-configs';
import { createQueryBuilder } from 'typeorm';
import { DoubleKeysMap } from '../util/double-keys-map';
import { Cache } from 'cache-manager';

@Injectable()
export class DeviceTemperatureService {
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
      const data = await this.temperatureRepository.create(temperature);

      return createQueryBuilder()
        .insert()
        .into(Temperature)
        .values(data)
        .execute();
    } catch (e) {
      throw e;
    }
  }

  setCurrentTemperature(
    masterId: number,
    slaveId: number,
    temperature: number,
  ) {
    return this.currentTemperatures.set([masterId, slaveId], temperature);
  }

  /**
   * Todo: Redis로 대체해서
   *       걷어내야함*/
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

  /*  TODO: Change Slave Count After Demo  */
  @Interval(3000)
  private requestTemperatureInterval() {
    // this.requestTemperature(1, 0x11);
    // for (let masterId = 0; masterId <= 5; masterId++) {
    //   for (let slaveId = 0; slaveId <= 0x127; slaveId += 0x11) {
    //     this.requestTemperature(masterId, slaveId);
    //   }
    // }
  }

  requestTemperature(masterId: number, slaveId: number) {
    /*  TODO: Change Topic After Demo  */
    const topic = `master/${masterId}/temperature`;
    const message = new TemperaturePacketDto(
      0x23,
      0x21,
      slaveId,
      0xc1,
      0x02,
      0x07,
      0xd0,
      [],
    );

    return this.deviceService.publishEvent(topic, JSON.stringify(message));
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

  async createTestData() {
    return this.temperatureRepository.createTestData(1, 0x12);
  }

  mockOverRangeTrigger() {
    console.log(`온도 범위 값 초과`);
  }

  async cacheTemperature(
    masterId: number,
    slaveId: number,
    temperature: number,
  ) {
    /**
     * Todo: Extract Create Key Function */
    const key = `temperature/${masterId}/${slaveId}`;
    console.log(`key: `, key);
    const beforeValue = await this.cacheManager.get<number>(key);
    console.log(`before cached value: `, beforeValue);
    return this.cacheManager.set<number>(key, temperature, { ttl: 0 });
  }
}
