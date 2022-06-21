import { CACHE_MANAGER, Controller, Inject } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MqttContext,
  Payload,
  Transport,
} from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { TemperatureRangeDto } from 'src/api/dto/temperature/temperature-range.dto';
import {
  EPowerState,
  ESlaveTurnPowerTopic,
} from 'src/util/constants/api-topic';
import { TEMPERATURE } from 'src/util/constants/mqtt-topic';
import { SensorPowerKey } from 'src/util/key-generator';
import { RedisService } from '../../cache/redis.service';
import { Temperature } from '../entities/temperature.entity';
import { DeviceFanService } from '../fan/device-fan.service';
import { DeviceTemperatureService } from './device-temperature.service';

@Controller()
export class DeviceTemperatureController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly deviceTemperatureService: DeviceTemperatureService,
    private readonly deviceFanService: DeviceFanService,
    private readonly redisService: RedisService,
  ) {}

  @EventPattern(TEMPERATURE, Transport.MQTT)
  async receiveTemperature(
    @Payload() temperature: number,
    @Ctx() context: MqttContext,
  ) {
    const [, mId, , sId] = context.getTopic().split('/');
    const masterId = parseInt(mId); // 🤔
    const slaveId = parseInt(sId);

    try {
      /**
       * Todo: id로 캐싱된 온도 범위 가져옴
       *       캐싱된 범위 없으면 db 조회 */
      const [rangeMin, rangeMax] = // 🤔
        await this.deviceTemperatureService.getTemperatureRange(
          masterId,
          slaveId,
        );

      const fanPowerKey = SensorPowerKey({
        sensor: ESlaveTurnPowerTopic.FAN,
        masterId,
        slaveId,
      });

      const fanPowerState = await this.cacheManager.get<EPowerState>(
        fanPowerKey,
      );

      /** Fan 자동운전 켜져있을때만 작동 */
      if (fanPowerState === EPowerState.ON) {
        await this.deviceFanService.turnFan(
          { masterId, slaveId }, // 🤔
          new TemperatureRangeDto(temperature, rangeMin, rangeMax),
        );
      }

      const saveResult = await this.deviceTemperatureService.saveTemperature(
        new Temperature(masterId, slaveId, temperature),
      );
    } catch (e) {
      throw e;
    }
  }
}
