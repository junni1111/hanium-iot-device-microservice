import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { DeviceService } from './device.service';
import { Cache } from 'cache-manager';
import { FanPacketDto } from './dto/fan-packet.dto';
import { FanPowerDto } from '../api/dto/fan/fan-power.dto';
import { EPowerState } from '../util/constants/api-topic';

@Injectable()
export class DeviceFanService {
  constructor(
    @Inject(MQTT_BROKER) private readonly mqttBroker: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly deviceService: DeviceService,
  ) {}

  async turnFan({ masterId, slaveId, powerState }: FanPowerDto) {
    /** Todo: Add Fan Topic Device Gateway
     *        Change Topic temperature -> fan*/
    const topic = `master/${masterId}/temperature`;
    const fanState = powerState === EPowerState.ON ? 0xfb : 0x0f;

    const message = new FanPacketDto(
      0x23,
      0x24,
      slaveId,
      0xd1,
      0x01,
      0x10, // Fan Memory Address start - 4120
      0x19,
      [fanState],
    );

    /** Todo: Refactoring */
    await this.cacheManager.set<string>(
      `fan/${masterId}/${slaveId}`,
      powerState === EPowerState.ON ? EPowerState.ON : EPowerState.OFF,
      { ttl: 60 }, // mock ttl
    );

    return this.deviceService.publishEvent(topic, JSON.stringify(message));
  }

  async requestMockFan(masterId: number, slaveId: number) {
    const topic = `master/${masterId}/temperature`;
    const message = new FanPacketDto(
      0x23,
      0x24,
      slaveId,
      0xd1,
      0x05,
      0x10, // Fan Memory Address start - 4120
      0x19,
      [0xaf, 0x00, 0x00, 0x00, 2], // 2분간 동작. 동작 완료후 이벤트 폴링 x
    );

    return this.deviceService.publishEvent(topic, JSON.stringify(message));
  }
}
