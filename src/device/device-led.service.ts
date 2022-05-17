import { Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { LedPacketDto } from './dto/led-packet.dto';
import { SlaveConfigDto } from '../api/dto/slave/slave-config.dto';
import { DeviceService } from './device.service';
import { ILedConfig } from './interfaces/slave-configs';
import { SlaveRepository } from './repositories/slave.repository';
import { LedTurnDto } from '../api/dto/led/led-turn.dto';
import { EPowerState } from '../util/constants/api-topic';

@Injectable()
export class DeviceLedService {
  constructor(
    @Inject(MQTT_BROKER) private readonly mqttBroker: ClientProxy,
    private readonly deviceService: DeviceService,
    private readonly slaveRepository: SlaveRepository,
  ) {}

  /**
   * Todo: 더 좋은 방법 고민 */
  async turnLed({ masterId, slaveId, powerState }: LedTurnDto) {
    const ledState = powerState === EPowerState.ON ? 0xfb : 0x0f;

    const topic = `master/${masterId}/led`;

    console.log(topic);
    const message = new LedPacketDto(
      0x23,
      0x22,
      slaveId,
      0xd1,
      0x01,
      0x0f,
      0xdd,
      //통보없이 자동 off : 0xaf
      [ledState],
    );

    console.log(message);

    return this.deviceService.publishEvent(topic, JSON.stringify(message));
  }

  async requestLed({
    masterId,
    slaveId,
    ledCycle,
    ledRuntime,
  }: Partial<SlaveConfigDto>) {
    try {
      const cycleHigh = (ledCycle & 0xff00) / 0x100;
      const cycleLow = ledCycle & 0x00ff;
      const runtimeHigh = (ledRuntime & 0xff00) / 0x100;
      const runtimeLow = ledRuntime & 0x00ff;
      const topic = `master/${masterId}/led`;

      console.log(topic);
      const message = new LedPacketDto(
        0x23,
        0x22,
        slaveId,
        0xd1,
        0x05,
        0x0f,
        0xdd,
        //통보없이 자동 off : 0xaf
        [0xaa, cycleHigh, cycleLow, runtimeHigh, runtimeLow],
      );

      console.log(message);

      return this.deviceService.publishEvent(topic, JSON.stringify(message));
    } catch (e) {
      console.log(e);
    }
  }

  checkLedState(masterId: number, slaveId: number) {
    const topic = `master/${masterId}/led`;
    const ledMessage = new LedPacketDto(
      0x23,
      0x24,
      slaveId,
      0xc1,
      0x01,
      0x0f,
      0xdc,
      [],
    );
    this.deviceService.publishEvent(topic, JSON.stringify(ledMessage));
  }

  async setLedConfig({
    masterId,
    slaveId,
    ledCycle,
    ledRuntime,
  }: Partial<SlaveConfigDto>) {
    try {
      const config: ILedConfig = { ledCycle, ledRuntime };
      return this.slaveRepository.setConfig(masterId, slaveId, config);
    } catch (e) {
      console.log(e);
    }
  }
}
