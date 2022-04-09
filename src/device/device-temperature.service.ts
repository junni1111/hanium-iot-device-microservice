import { Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class DeviceTemperatureService {
  constructor(
    @Inject(MQTT_BROKER) private readonly mqttBroker: ClientProxy,
    private readonly temperatureRepository: TemperatureRepository,
    private readonly deviceService: DeviceService,
    private readonly slaveRepository: SlaveRepository,
  ) {}

  async saveTemperature(temperature: Temperature): Promise<Temperature> {
    try {
      const data = await this.temperatureRepository.create(temperature);

      return this.temperatureRepository.save(data);
    } catch (e) {
      throw e;
    }
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
}
