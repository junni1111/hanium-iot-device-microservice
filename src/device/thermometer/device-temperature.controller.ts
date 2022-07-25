import { CACHE_MANAGER, Controller, Inject, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MqttContext,
  Payload,
  Transport,
} from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { DeviceFanService } from '../fan/device-fan.service';
import { DeviceTemperatureService } from './device-temperature.service';
import { TemperatureRangeDto } from '../../api/dto/temperature/temperature-range.dto';
import { TEMPERATURE } from '../../util/constants/mqtt-topic';

@Controller()
export class DeviceTemperatureController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly deviceTemperatureService: DeviceTemperatureService,
    private readonly deviceFanService: DeviceFanService,
  ) {}

  @EventPattern(TEMPERATURE, Transport.MQTT)
  async receiveTemperature(
    @Payload() temperature: number,
    @Ctx() context: MqttContext,
  ) {
    const [, mId, , sId] = context.getTopic().split('/');
    const masterId = parseInt(mId);
    const slaveId = parseInt(sId);

    try {
      const [rangeMin, rangeMax] =
        await this.deviceTemperatureService.getTemperatureRange(
          masterId,
          slaveId,
        );

      const range = new TemperatureRangeDto(temperature, rangeMin, rangeMax);
      const turnResult = this.deviceFanService.turnFan(
        masterId,
        slaveId,
        range,
      );

      Logger.log(turnResult);
      // Todo: Refactor
      const saveResults = await this.deviceTemperatureService.saveTemperature(
        masterId,
        slaveId,
        temperature,
        new Date(),
      );
      Logger.debug(saveResults);
      console.log(`saveResults: `, saveResults);
    } catch (e) {
      throw e;
    }
  }
}
