import { Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { WaterPumpPacketDto } from './dto/water-pump-packet.dto';
import { SlaveConfigDto } from '../api/dto/slave-config.dto';
import { DeviceService } from './device.service';
import { IWaterPumpConfig } from './interfaces/slave-configs';
import { SlaveRepository } from './repositories/slave.repository';

@Injectable()
export class DeviceWaterPumpService {
  constructor(
    @Inject(MQTT_BROKER) private readonly mqttBroker: ClientProxy,
    private readonly deviceService: DeviceService,
    private readonly slaveRepository: SlaveRepository,
  ) {}

  async requestWaterPump({
    masterId,
    slaveId,
    waterPumpCycle,
    waterPumpRuntime,
  }: Partial<SlaveConfigDto>) {
    try {
      const cycleHigh = (waterPumpCycle & 0xff00) / 0x100;
      const cycleLow = waterPumpCycle & 0x00ff;
      const runtimeHigh = (waterPumpRuntime & 0xff00) / 0x100;
      const runtimeLow = waterPumpRuntime & 0x00ff;
      const topic = `master/${parseInt(masterId.toString(), 16)}/water`;

      console.log(`request water pump: `, slaveId);
      const message = new WaterPumpPacketDto(
        0x23,
        0x22,
        parseInt(slaveId.toString(), 16),
        0xd1,
        0x05,
        0x0f,
        0xa1,
        [0xaf, cycleHigh, cycleLow, runtimeHigh, runtimeLow],
      );
      return this.deviceService.publishEvent(topic, JSON.stringify(message));
    } catch (e) {
      console.log(e);
    }
  }

  checkWaterPumpState(masterId: number, slaveId: number) {
    const topic = `master/${masterId}/water`;
    const motorMessage = new WaterPumpPacketDto(
      0x23,
      0x21,
      slaveId,
      0xc1,
      0x01,
      0x0f,
      0xa0,
      [],
    );
    this.deviceService.publishEvent(topic, JSON.stringify(motorMessage));
  }

  async setWaterPumpConfig({
    masterId,
    slaveId,
    waterPumpCycle,
    waterPumpRuntime,
  }: Partial<SlaveConfigDto>) {
    try {
      const config: IWaterPumpConfig = {
        waterPumpCycle,
        waterPumpRuntime,
      };
      return this.slaveRepository.setConfig(masterId, slaveId, config);
    } catch (e) {
      console.log(e);
    }
  }
}
