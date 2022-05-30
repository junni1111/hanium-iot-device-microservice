import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { DeviceService } from './device.service';
import { Cache } from 'cache-manager';
import { SlaveConfigDto } from '../api/dto/slave/slave-config.dto';
import { FanPacketDto } from './dto/fan-packet.dto';
import { LedTurnDto } from '../api/dto/led/led-turn.dto';
import { EPowerState } from '../util/constants/api-topic';
import { LedPacketDto } from './dto/led-packet.dto';

@Injectable()
export class DeviceFanService {
  constructor(
    @Inject(MQTT_BROKER) private readonly mqttBroker: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly deviceService: DeviceService,
  ) {}

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
