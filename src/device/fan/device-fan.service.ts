import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { DeviceService } from '../device.service';
import { Cache } from 'cache-manager';
import { FanPacketDto } from '../dto/fan-packet.dto';
import { FanPowerDto } from '../../api/dto/fan/fan-power.dto';
import { EPowerState, ESlaveState } from '../../util/constants/api-topic';
import { ECommand } from '../interfaces/packet';
import { TemperatureRangeDto } from '../../api/dto/temperature/temperature-range.dto';
import { SensorStateKey } from '../../util/key-generator';

@Injectable()
export class DeviceFanService {
  constructor(
    @Inject(MQTT_BROKER) private readonly mqttBroker: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly deviceService: DeviceService,
  ) {}

  async turnFan(
    { masterId, slaveId }: FanPowerDto,
    range: TemperatureRangeDto,
  ) {
    let powerCommand: number;
    let powerState: EPowerState;

    if (!range.contains()) {
      powerState = EPowerState.ON;
      powerCommand = 0xfb; // Fan ON
    } else {
      powerState = EPowerState.OFF;
      powerCommand = 0x0f; // Fan OFF
    }

    const topic = `master/${masterId}/fan`;
    const message = new FanPacketDto(
      0x23,
      0x22,
      slaveId,
      ECommand.WRITE,
      0x01,
      0x10, // Fan Memory Address start - 4120
      0x19,
      [powerCommand],
    );

    const key = SensorStateKey({ sensor: ESlaveState.FAN, masterId, slaveId });
    await this.cacheManager.set<string>(key, powerState, { ttl: 60 });

    return this.deviceService.publishEvent(topic, JSON.stringify(message));
  }

  /** Todo: Refactor after changing protocol */
  async mockTurnOff({ masterId, slaveId }: FanPowerDto) {
    const topic = `master/${masterId}/fan`;
    const powerOff = 0x0f;

    const message = new FanPacketDto(
      0x23,
      0x22,
      slaveId,
      ECommand.WRITE,
      0x01,
      0x10,
      0x19,
      [powerOff],
    );

    return this.deviceService.publishEvent(topic, JSON.stringify(message));
  }
}
