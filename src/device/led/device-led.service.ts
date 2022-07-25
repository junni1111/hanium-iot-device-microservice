import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { LedPacketDto } from '../dto/led-packet.dto';
import { SlaveConfigDto } from '../../api/dto/slave/slave-config.dto';
import { ILedConfig } from '../interfaces/slave-configs';
import { LedPowerDto } from '../../api/dto/led/led-power.dto';
import { EPowerState } from '../../util/constants/api-topic';
import { Cache } from 'cache-manager';
import { ECommand } from '../interfaces/packet';
import { MqttBrokerService } from '../mqtt-broker.service';
import { LedRepository } from '../repositories/led.repository';

@Injectable()
export class DeviceLedService {
  constructor(
    @Inject(MQTT_BROKER) private readonly mqttBroker: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private brokerService: MqttBrokerService,
    private ledConfigRepository: LedRepository,
  ) {}

  /**
   * Todo: 더 좋은 방법 고민 */
  async turnLed({ masterId, slaveId, powerState }: LedPowerDto) {
    const ledState = powerState === EPowerState.ON ? 0xfb : 0x0f;
    const topic = `master/${masterId}/led`;

    const message = new LedPacketDto(
      0x23,
      0x22,
      slaveId,
      ECommand.WRITE,
      0x01,
      0x0f,
      0xdd,
      //통보없이 자동 off : 0xaf
      [ledState],
    );

    return this.brokerService.publish(topic, JSON.stringify(message));
  }

  async requestLed({
    masterId,
    slaveId,
    ledCycle,
    ledRuntime,
  }: Partial<SlaveConfigDto>) {
    try {
      console.log(`Request LED: `, masterId, slaveId, ledCycle, ledRuntime);
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

      return this.brokerService.publish(topic, JSON.stringify(message));
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
    this.brokerService.publish(topic, JSON.stringify(ledMessage));
  }

  getConfig(masterId: number, slaveId: number) {
    return this.ledConfigRepository.findBySlave(masterId, slaveId);
  }

  async setConfig({
    masterId,
    slaveId,
    ledCycle,
    ledRuntime,
  }: Partial<SlaveConfigDto>) {
    try {
      const config: ILedConfig = { ledCycle, ledRuntime };
      return this.ledConfigRepository.setConfig(masterId, slaveId, config);
    } catch (e) {
      console.log(e);
    }
  }
}
