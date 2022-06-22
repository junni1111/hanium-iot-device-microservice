import { CACHE_MANAGER, Controller, HttpStatus, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { ResponseStatus } from '../../device/interfaces/response-status';
import {
  ESlaveConfigTopic,
  TEMPERATURE_BETWEEN,
  TEMPERATURE_WEEK,
} from '../../util/constants/api-topic';
import { DeviceTemperatureService } from '../../device/thermometer/device-temperature.service';
import { Cache } from 'cache-manager';
import { SlaveConfigDto } from '../dto/slave/slave-config.dto';
import { SensorConfigKey } from '../../util/key-generator';
import { TemperatureBetweenDto } from '../dto/temperature/temperature-between.dto';
import { DeviceFanService } from 'src/device/fan/device-fan.service';
import { RedisService } from 'src/cache/redis.service';

@Controller()
export class ApiThermometerController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly deviceTemperatureService: DeviceTemperatureService,
    private readonly deviceFanService: DeviceFanService,
    private readonly redisService: RedisService,
  ) {}

  @MessagePattern(TEMPERATURE_BETWEEN, Transport.TCP)
  async fetchTemperatures(
    @Payload() temperatureBetweenDto: TemperatureBetweenDto,
  ): Promise<ResponseStatus> {
    try {
      const temperatures =
        await this.deviceTemperatureService.getTemperaturesBetweenDates(
          temperatureBetweenDto.masterId,
          temperatureBetweenDto.slaveId,
          temperatureBetweenDto.begin,
          temperatureBetweenDto.end,
        );

      return {
        status: HttpStatus.OK,
        topic: TEMPERATURE_BETWEEN,
        message: 'success',
        data: temperatures,
      };
    } catch (e) {
      throw e;
    }
  }

  @MessagePattern(TEMPERATURE_WEEK, Transport.TCP)
  async fetchTemperatureOneWeek(
    @Payload() payload: string,
  ): Promise<ResponseStatus> {
    try {
      /* Todo: Change to DTO */
      const { master_id, slave_id } = JSON.parse(payload);

      const data = await this.deviceTemperatureService.getWeekTemperatureCache(
        `temperature/week/${master_id}/${slave_id}/*`,
      );

      return {
        status: HttpStatus.OK,
        topic: TEMPERATURE_WEEK,
        message: 'success',
        data,
      };
    } catch (e) {
      console.log(e);
    }
  }

  /** Todo: Extract to service */
  @MessagePattern(ESlaveConfigTopic.TEMPERATURE, Transport.TCP)
  async setTemperatureConfig(@Payload() temperatureConfigDto: SlaveConfigDto) {
    /** Todo: Change Key */
    const key = SensorConfigKey({
      sensor: ESlaveConfigTopic.TEMPERATURE,
      masterId: temperatureConfigDto.masterId,
      slaveId: temperatureConfigDto.slaveId,
    });

    try {
      const configUpdateResult =
        await this.deviceTemperatureService.setTemperatureConfig(
          temperatureConfigDto,
        );

      if (!configUpdateResult.affected) {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          topic: ESlaveConfigTopic.TEMPERATURE,
          message: 'temperature config not affected',
          data: configUpdateResult,
        };
      }

      /** Todo: 범위 값 저장 방식 고민 */
      const cachedResult = await this.cacheManager.set<number[]>(
        key,
        [
          temperatureConfigDto.startTemperatureRange,
          temperatureConfigDto.endTemperatureRange,
        ],
        { ttl: 3600 },
      );

      return {
        status: HttpStatus.OK,
        topic: ESlaveConfigTopic.TEMPERATURE,
        message: 'success to save temperature config',
        data: cachedResult,
      };
    } catch (e) {
      console.log(`catch temperature config error`, e);
      return e;
    }
  }

  /* Todo: Change topic */
  @MessagePattern('temperature/now', Transport.TCP)
  async getCurrentTemperature(
    @Payload() payload: string,
  ): Promise<ResponseStatus> {
    /* Todo: Change to DTO */
    const { master_id, slave_id } = JSON.parse(payload);
    const data = await this.deviceTemperatureService.getCurrentTemperature(
      parseInt(master_id),
      parseInt(slave_id),
    );

    return {
      status: HttpStatus.OK,
      topic: 'temperature',
      message: 'success fetch current temperature',
      data,
    };
  }
}
