import { CACHE_MANAGER, Controller, HttpStatus, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { DeviceService } from '../../device/device.service';
import { DevicePollingService } from '../../device/device-polling.service';
import { DeviceMasterService } from '../../device/device-master.service';
import { ResponseStatus } from '../../device/interfaces/response-status';
import {
  EPowerState,
  ESlaveConfigTopic,
  ESlaveState,
  ESlaveTurnPowerTopic,
  TEMPERATURE_WEEK,
} from '../../util/constants/api-topic';
import { DeviceLedService } from '../../device/device-led.service';
import { DeviceWaterPumpService } from '../../device/device-water-pump.service';
import { DeviceTemperatureService } from '../../device/device-temperature.service';
import { LedPowerDto } from '../dto/led/led-power.dto';
import { WaterPowerTurnDto } from '../dto/water-pump/water-power-turn.dto';
import { LedStateDto } from '../dto/led/led-state.dto';
import { Cache } from 'cache-manager';
import { WaterPumpStateDto } from '../dto/water-pump/water-pump-state.dto';
import { ApiLedService } from '../led/api-led.service';
import { ApiWaterPumpService } from '../water-pump/api-water-pump.service';
import { SlaveStateDto } from '../dto/slave/slave-state.dto';
import { SlaveConfigDto } from '../dto/slave/slave-config.dto';
import { Slave } from '../../device/entities/slave.entity';
import { ApiSlaveService } from '../slave/api-slave.service';

@Controller()
export class ApiThermometerController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly masterService: DeviceMasterService,
    private readonly pollingService: DevicePollingService,
    private readonly apiSlaveService: ApiSlaveService,
    private readonly apiLedService: ApiLedService,
    private readonly apiWaterPumpService: ApiWaterPumpService,
    private readonly deviceService: DeviceService,
    private readonly deviceLedService: DeviceLedService,
    private readonly deviceWaterPumpService: DeviceWaterPumpService,
    private readonly deviceTemperatureService: DeviceTemperatureService,
  ) {}

  @MessagePattern(TEMPERATURE_WEEK, Transport.TCP)
  async fetchTemperatureOneWeek(
    @Payload() payload: string,
  ): Promise<ResponseStatus> {
    try {
      /* Todo: Change to DTO */
      const { master_id, slave_id } = JSON.parse(payload);
      const data = await this.deviceTemperatureService.fetchTemperature(
        master_id,
        slave_id,
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

  /** Todo: Extract Controller */
  @MessagePattern(ESlaveConfigTopic.TEMPERATURE, Transport.TCP)
  async setTemperatureConfig(@Payload() temperatureConfigDto: SlaveConfigDto) {
    console.log(`call set temperature config`, temperatureConfigDto);
    /** Todo: Change Key */
    const temperatureRangeKey = `master/${temperatureConfigDto.masterId}/slave/${temperatureConfigDto.slaveId}/${ESlaveConfigTopic.TEMPERATURE}`;
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
        temperatureRangeKey,
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
      console.log(`catch led config error`, e);
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
