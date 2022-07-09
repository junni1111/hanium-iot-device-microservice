import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { WaterPumpPacketDto } from '../dto/water-pump-packet.dto';
import { SlaveConfigDto } from '../../api/dto/slave/slave-config.dto';
import { DeviceService } from '../device.service';
import { IWaterPumpConfig } from '../interfaces/slave-configs';
import { SlaveRepository } from '../repositories/slave.repository';
import {
  EPowerState,
  ESlaveState,
  ESlaveTurnPowerTopic,
} from '../../util/constants/api-topic';
import { LedPowerDto } from '../../api/dto/led/led-power.dto';
import { Cache } from 'cache-manager';
import { SensorPowerKey, SensorStateKey } from '../../util/key-generator';
import { WaterPumpRepository } from '../repositories/water-pump.repository';
import { MqttBrokerService } from '../mqtt-broker.service';

@Injectable()
export class DeviceWaterPumpService {
  constructor(
    @Inject(MQTT_BROKER) private brokerService: MqttBrokerService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private pumpConfigRepository: WaterPumpRepository,
  ) {}

  async turnWaterPump({ masterId, slaveId, powerState }: LedPowerDto) {
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

    return this.brokerService.publish(topic, JSON.stringify(message));
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
      return this.brokerService.publish(topic, JSON.stringify(message));
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
    this.brokerService.publish(topic, JSON.stringify(motorMessage));
  }

  /**
   * Todo: Refactoring */
  async cacheWaterPumpState(
    masterId: number,
    slaveId: number,
    powerState: EPowerState,
    runtime?: number,
  ) {
    const runningStateKey = SensorStateKey({
      sensor: ESlaveState.WATER_PUMP,
      masterId,
      slaveId,
    });
    const powerStateKey = SensorPowerKey({
      sensor: ESlaveTurnPowerTopic.WATER_PUMP,
      masterId,
      slaveId,
    });

    const cacheRunningState = this.cacheManager.set<string>(
      runningStateKey,
      powerState,
      {
        ttl: runtime ? runtime * 60 : 0,
      },
    );
    const cachePowerState = this.cacheManager.set<string>(
      powerStateKey,
      powerState,
      { ttl: 0 },
    );

    Promise.allSettled([cacheRunningState, cachePowerState]);
  }

  setConfigs({
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
      return this.pumpConfigRepository.setConfigs(masterId, slaveId, config);
    } catch (e) {
      console.log(e);
    }
  }
}
