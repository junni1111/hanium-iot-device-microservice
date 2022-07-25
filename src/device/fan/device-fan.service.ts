import {
  CACHE_MANAGER,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { MQTT_BROKER } from '../../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { FanPacketDto } from '../dto/fan-packet.dto';
import { FanPowerDto } from '../../api/dto/fan/fan-power.dto';
import {
  EPowerState,
  ESlaveState,
  ESlaveTurnPowerTopic,
} from '../../util/constants/api-topic';
import { ECommand } from '../interfaces/packet';
import { TemperatureRangeDto } from '../../api/dto/temperature/temperature-range.dto';
import { SensorPowerKey, SensorStateKey } from '../../util/key-generator';
import { MqttBrokerService } from '../mqtt-broker.service';

@Injectable()
export class DeviceFanService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache, // private readonly deviceService: DeviceService,
    private brokerService: MqttBrokerService,
  ) {}

  async turnFan(
    masterId: number,
    slaveId: number,
    temperatureRangeDto: TemperatureRangeDto,
  ) {
    const fanPowerKey = SensorPowerKey({
      sensor: ESlaveTurnPowerTopic.FAN,
      masterId,
      slaveId,
    });

    const fanPowerState = await this.cacheManager.get<EPowerState>(fanPowerKey);
    if (fanPowerState === EPowerState.OFF) {
      Logger.debug(`현재 FAN 전원이 꺼져있음`);
      return;
    }

    const willRunningState = this.getWillState(temperatureRangeDto);
    const powerCommand = willRunningState === EPowerState.OFF ? 0x0f : 0xfb;

    this.sendTurnPacket(masterId, slaveId, powerCommand);
    return this.cacheFanState(masterId, slaveId, willRunningState);
  }

  sendTurnPacket(masterId: number, slaveId: number, powerCommand: number) {
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

    return this.brokerService.publish(topic, JSON.stringify(message));
  }

  /** 설정한 온도 범위 초과: 팬 작동
   *  정상 온도 범위: 팬 멈춤
   * */
  private getWillState(range: TemperatureRangeDto) {
    return range.contains() ? EPowerState.OFF : EPowerState.ON;
  }

  private cacheFanState(
    masterId: number,
    slaveId: number,
    willPowerState: EPowerState,
  ) {
    const key = SensorStateKey({ sensor: ESlaveState.FAN, masterId, slaveId });
    return this.cacheManager.set<string>(key, willPowerState, { ttl: 60 });
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

    return this.brokerService.publish(topic, JSON.stringify(message));
  }
}
