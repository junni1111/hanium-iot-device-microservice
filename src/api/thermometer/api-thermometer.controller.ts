import {
  BadRequestException,
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
import { ESlaveConfigTopic } from '../../util/constants/api-topic';
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
        throw new BadRequestException('temperature config not affected');
      }

      /** Todo: 범위 값 저장 방식 고민 */
      const cachedResult = await this.cacheManager.set<number[]>(
        key,
        [temperatureConfigDto.rangeBegin, temperatureConfigDto.rangeEnd],
        { ttl: 3600 },
      );

      return cachedResult;
    } catch (e) {
      console.log(`catch temperature config error`, e);
      throw e;
    }
  }

  @Post('between')
  async fetchTemperatures(
    @Body() temperatureBetweenDto: TemperatureBetweenDto,
  ) {
    try {
      const temperatures =
        await this.deviceTemperatureService.getTemperaturesBetweenDates(
          temperatureBetweenDto.masterId,
          temperatureBetweenDto.slaveId,
          temperatureBetweenDto.begin,
          temperatureBetweenDto.end,
        );

      return temperatures;
    } catch (e) {
      console.log('catch fetch temperature error', e);
      throw e;
    }
  }

  @Post('week')
  async fetchTemperatureOneWeek(
    @Body() temperatureBetweenDto: TemperatureBetweenDto,
  ) {
    try {
      const temperatures = await this.deviceTemperatureService.getAveragePoints(
        temperatureBetweenDto.masterId,
        temperatureBetweenDto.slaveId,
        new Date(temperatureBetweenDto.begin),
        new Date(temperatureBetweenDto.end),
        addDays,
        1,
      );

      return temperatures;
    } catch (e) {
      console.log('catch fetch temperature error', e);
      throw e;
    }
  }

  /* Todo: Change topic */
  @Get('now')
  async getCurrentTemperature(
    @Query('masterId') masterId: number,
    @Query('slaveId') slaveId: number,
  ) {
    /* Todo: Change to DTO */
    try {
      const temperature =
        await this.deviceTemperatureService.getCachedTemperature(
          masterId,
          slaveId,
        );

      return temperature;
    } catch (e) {
      console.log('catch get current temperature error', e);
      throw e;
    }
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
