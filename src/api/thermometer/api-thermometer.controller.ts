import {
  Body,
  CACHE_MANAGER,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Post,
  Query,
} from '@nestjs/common';
import { ResponseStatus } from '../../device/interfaces/response-status';
import {
  ESlaveConfigTopic,
  TEMPERATURE_BETWEEN,
  TEMPERATURE_WEEK,
} from '../../util/constants/api-topic';
import { DeviceTemperatureService } from '../../device/thermometer/device-temperature.service';
import { Cache } from 'cache-manager';
import { SensorConfigKey } from '../../util/key-generator';
import { TemperatureBetweenDto } from './dto/temperature-between.dto';
import { addDays } from 'date-fns';
import { ApiTags } from '@nestjs/swagger';
import { THERMOMETER } from '../../util/constants/swagger';
import { TemperatureConfigDto } from './dto/temperature-config.dto';

@ApiTags(THERMOMETER)
@Controller('temperature')
export class ApiThermometerController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly deviceTemperatureService: DeviceTemperatureService,
  ) {}

  /** Todo: Extract to service */
  @Post('config')
  async setTemperatureConfig(
    @Body() temperatureConfigDto: TemperatureConfigDto,
  ) {
    /** Todo: Change Key */
    const key = SensorConfigKey({
      sensor: ESlaveConfigTopic.TEMPERATURE,
      masterId: temperatureConfigDto.masterId,
      slaveId: temperatureConfigDto.slaveId,
    });

    try {
      const configUpdateResult = await this.deviceTemperatureService.setConfig(
        temperatureConfigDto,
      );

      if (!configUpdateResult) {
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
        [temperatureConfigDto.rangeBegin, temperatureConfigDto.rangeEnd],
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

  @Post('between')
  async fetchTemperatures(
    @Body() temperatureBetweenDto: TemperatureBetweenDto,
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

  @Post('week')
  async fetchTemperatureOneWeek(
    @Body() temperatureBetweenDto: TemperatureBetweenDto,
  ): Promise<ResponseStatus> {
    try {
      const data = await this.deviceTemperatureService.getAveragePoints(
        temperatureBetweenDto.masterId,
        temperatureBetweenDto.slaveId,
        new Date(temperatureBetweenDto.begin),
        new Date(temperatureBetweenDto.end),
        addDays,
        1,
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

  /* Todo: Change topic */
  @Get('now')
  async getCurrentTemperature(
    @Query('masterId') masterId: number,
    @Query('slaveId') slaveId: number,
  ): Promise<ResponseStatus> {
    /* Todo: Change to DTO */
    const data = await this.deviceTemperatureService.getCachedTemperature(
      masterId,
      slaveId,
    );

    return {
      status: HttpStatus.OK,
      topic: 'temperature',
      message: 'success fetch current temperature',
      data,
    };
  }

  @Delete('db')
  clearTemperatureDB(@Query('type') type: string) {
    return this.deviceTemperatureService.clearTemperatureDB(type);
  }

  // @MessagePattern('test/temperature', Transport.TCP)
  // async createTestTemperatureData(@Payload() slaveStateDto: SlaveStateDto) {
  //   console.log(`create test data...`, slaveStateDto);
  //
  //   return await this.deviceTemperatureService.createTestData(
  //     slaveStateDto.masterId,
  //     slaveStateDto.slaveId,
  //   );
  // }
}
