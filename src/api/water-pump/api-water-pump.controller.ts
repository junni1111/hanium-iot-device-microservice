import {
  Body,
  CACHE_MANAGER,
  Controller,
  Delete,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ResponseStatus } from '../../device/interfaces/response-status';
import {
  EPowerState,
  ESlaveConfigTopic,
  ESlaveState,
  ESlaveTurnPowerTopic,
} from '../../util/constants/api-topic';
import { DeviceWaterPumpService } from '../../device/water-pump/device-water-pump.service';
import { WaterPumpPowerDto } from './dto/water-pump-power.dto';
import { Cache } from 'cache-manager';
import { WaterPumpStateDto } from './dto/water-pump-state.dto';
import { ApiWaterPumpService } from './api-water-pump.service';
import { ApiSlaveService } from '../slave/api-slave.service';
import { DeviceMasterService } from '../../device/master/device-master.service';
import { SensorPowerKey, SensorStateKey } from '../../util/key-generator';
import { IWaterPumpConfig } from '../../device/interfaces/slave-configs';
import { ApiTags } from '@nestjs/swagger';
import { WATER_PUMP } from '../../util/constants/swagger';
import { WaterPumpConfigDto } from './dto/water-pump-config.dto';

@ApiTags(WATER_PUMP)
@Controller('water-pump')
export class ApiWaterPumpController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly apiSlaveService: ApiSlaveService,
    private readonly deviceMasterService: DeviceMasterService,
    private readonly apiWaterPumpService: ApiWaterPumpService,
    private readonly deviceWaterPumpService: DeviceWaterPumpService,
  ) {}

  @Post('config')
  async setWaterPumpConfig(
    @Body() waterPumpConfigDto: WaterPumpConfigDto,
  ): Promise<ResponseStatus> {
    try {
      const requestResult =
        this.deviceWaterPumpService.requestWaterPump(waterPumpConfigDto);

      if (waterPumpConfigDto.waterPumpRuntime > 0) {
        const powerStateKey = SensorPowerKey({
          sensor: ESlaveTurnPowerTopic.WATER_PUMP,
          masterId: waterPumpConfigDto.masterId,
          slaveId: waterPumpConfigDto.slaveId,
        });
        await this.cacheManager.set<string>(powerStateKey, 'on', { ttl: 0 });

        const key = SensorStateKey({
          sensor: ESlaveState.WATER_PUMP,
          masterId: waterPumpConfigDto.masterId,
          slaveId: waterPumpConfigDto.slaveId,
        });
        await this.cacheManager.set<string>(key, 'on', {
          ttl: waterPumpConfigDto.waterPumpRuntime * 60,
        });
      }

      const configUpdateResult = await this.deviceWaterPumpService.setConfig(
        waterPumpConfigDto,
      );

      if (!configUpdateResult) {
        return {
          status: HttpStatus.BAD_REQUEST,
          topic: ESlaveConfigTopic.WATER_PUMP,
          message: 'water pump config not affected',
          data: configUpdateResult,
        };
      }

      return {
        status: HttpStatus.OK,
        topic: ESlaveConfigTopic.WATER_PUMP,
        message: 'send water pump packet to device',
        data: requestResult,
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  @Post('state')
  async getWaterPumpState(
    @Body() waterPumpStateDto: WaterPumpStateDto,
  ): Promise<ResponseStatus> {
    try {
      const state = await this.apiSlaveService.getRunningState(
        waterPumpStateDto,
        ESlaveState.WATER_PUMP,
      );

      return {
        status: HttpStatus.OK,
        topic: ESlaveState.WATER_PUMP,
        message: 'request check water pump state success',
        data: state,
      };
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Todo: LED, 모터 둘다 포함 가능하게 고민*/
  @Post('power')
  async turnWaterPump(@Body() waterPumpPowerDto: WaterPumpPowerDto) {
    let configs: IWaterPumpConfig | undefined;
    try {
      console.log(`turn water dto: `, waterPumpPowerDto);

      if (waterPumpPowerDto.powerState === EPowerState.ON) {
        configs = await this.deviceWaterPumpService.getConfig(
          waterPumpPowerDto.masterId,
          waterPumpPowerDto.slaveId,
        );

        await this.deviceWaterPumpService.requestWaterPump({
          masterId: waterPumpPowerDto.masterId,
          slaveId: waterPumpPowerDto.slaveId,
          ...configs,
        });
      } else {
        /* Turn Off */
        await this.deviceWaterPumpService.turnWaterPump(waterPumpPowerDto);
      }

      const runningStateKey = SensorStateKey({
        sensor: ESlaveState.WATER_PUMP,
        masterId: waterPumpPowerDto.masterId,
        slaveId: waterPumpPowerDto.slaveId,
      });
      const powerStateKey = SensorPowerKey({
        sensor: ESlaveTurnPowerTopic.WATER_PUMP,
        masterId: waterPumpPowerDto.masterId,
        slaveId: waterPumpPowerDto.slaveId,
      });
      const cacheRunningState = this.cacheManager.set<string>(
        runningStateKey,
        waterPumpPowerDto.powerState,
        {
          ttl: configs?.waterPumpRuntime ? configs.waterPumpRuntime * 60 : 0,
        },
      );
      const cachePowerState = this.cacheManager.set<string>(
        powerStateKey,
        waterPumpPowerDto.powerState,
        { ttl: 0 },
      );

      Promise.allSettled([cacheRunningState, cachePowerState]);

      return {
        status: HttpStatus.OK,
        topic: ESlaveTurnPowerTopic.WATER_PUMP,
        message: 'send turn water pump packet to device',
        data: waterPumpPowerDto.powerState,
      };
    } catch (e) {
      console.log(`catch water pump config error`, e);
      return e;
    }
  }

  @Delete('db')
  clearWaterPumpDB() {
    return this.deviceWaterPumpService.clearWaterPumpDB();
  }
}
