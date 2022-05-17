import { Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { WaterPumpPacketDto } from './dto/water-pump-packet.dto';
import { SlaveConfigDto } from '../api/dto/slave/slave-config.dto';
import { DeviceService } from './device.service';
import { IWaterPumpConfig } from './interfaces/slave-configs';
import { SlaveRepository } from './repositories/slave.repository';
import { WaterPumpTurnDto } from '../api/dto/water-pump/water-pump-turn.dto';
import { EPowerState } from '../util/constants/api-topic';
import { LedTurnDto } from '../api/dto/led/led-turn.dto';

@Injectable()
export class DeviceWaterPumpService {
  constructor(
    @Inject(MQTT_BROKER) private readonly mqttBroker: ClientProxy,
    private readonly deviceService: DeviceService,
    private readonly slaveRepository: SlaveRepository,
  ) {}

  async turnWaterPump({ masterId, slaveId, powerState }: LedTurnDto) {
    const topic = `master/${masterId}/water`;
    const waterPumpState = powerState === EPowerState.ON ? 0xfb : 0x0f;

    console.log(topic);
    const message = new WaterPumpPacketDto(
      0x23,
      0x22,
      slaveId,
      0xd1,
      0x01,
      0x0f,
      0xa1,
      //통보없이 자동 off : 0xaf
      [waterPumpState],
    );

    console.log(message);

    return this.deviceService.publishEvent(topic, JSON.stringify(message));
  }

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
      const topic = `master/${masterId}/water`;

      console.log(`request water pump: `, slaveId);
      const message = new WaterPumpPacketDto(
        0x23,
        0x22,
        slaveId,
        0xd1,
        0x05,
        0x0f,
        0xa1,
        //통보없이 자동 off : 0xaf
        [0xaa, cycleHigh, cycleLow, runtimeHigh, runtimeLow],
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
