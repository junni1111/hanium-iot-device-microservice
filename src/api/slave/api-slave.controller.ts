import { CACHE_MANAGER, Controller, HttpStatus, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { DeviceService } from '../../device/device.service';
import { DevicePollingService } from '../../device/device-polling.service';
import { DeviceMasterService } from '../../device/master/device-master.service';
import { ResponseStatus } from '../../device/interfaces/response-status';
import {
  EPowerState,
  ESlaveConfigTopic,
  ESlaveState,
  ESlaveTurnPowerTopic,
  TEMPERATURE_WEEK,
} from '../../util/constants/api-topic';
import { DeviceLedService } from '../../device/led/device-led.service';
import { DeviceWaterPumpService } from '../../device/water-pump/device-water-pump.service';
import { DeviceTemperatureService } from '../../device/thermometer/device-temperature.service';
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
import { ApiSlaveService } from './api-slave.service';

@Controller()
export class ApiSlaveController {
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

  /** Todo: 센서들 상태 캐싱값 받아와서 돌려줌 */
  @MessagePattern(ESlaveState.ALL, Transport.TCP)
  async getSlaveState(
    @Payload() slaveStateDto: SlaveStateDto,
  ): Promise<ResponseStatus> {
    try {
      /* TODO: Validate master id & slave id */
      console.log(`call Slave State`, slaveStateDto);
      console.log(`mid, sid:`, slaveStateDto.masterId, slaveStateDto.slaveId);

      const sensorStates = await this.apiSlaveService.getSensorsState(
        slaveStateDto,
      );

      return {
        status: HttpStatus.OK,
        topic: ESlaveState.ALL,
        message: 'request check slave state success',
        data: sensorStates,
      };
    } catch (e) {
      console.log(e);
    }
  }

  @MessagePattern(ESlaveConfigTopic.ALL, Transport.TCP)
  async fetchConfig(@Payload() { masterId, slaveId }: Partial<SlaveConfigDto>) {
    try {
      const result = await this.masterService.getConfigs(masterId, slaveId);
      console.log(result);
      return result;
    } catch (e) {
      console.log(e);
    }
  }
}
