import { CACHE_MANAGER, Controller, HttpStatus, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { ResponseStatus } from '../../device/interfaces/response-status';
import {
  EPowerState,
  ESlaveConfigTopic,
  ESlaveState,
  ESlaveTurnPowerTopic,
} from '../../util/constants/api-topic';
import { DeviceWaterPumpService } from '../../device/water-pump/device-water-pump.service';
import { WaterPowerTurnDto } from '../dto/water-pump/water-power-turn.dto';
import { Cache } from 'cache-manager';
import { WaterPumpStateDto } from '../dto/water-pump/water-pump-state.dto';
import { ApiWaterPumpService } from './api-water-pump.service';
import { SlaveConfigDto } from '../dto/slave/slave-config.dto';
import { Slave } from '../../device/entities/slave.entity';
import { ApiSlaveService } from '../slave/api-slave.service';
import { DeviceMasterService } from '../../device/master/device-master.service';
import { SensorPowerKey, SensorStateKey } from '../../util/key-generator';

@Controller()
export class ApiWaterPumpController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly apiSlaveService: ApiSlaveService,
    private readonly deviceMasterService: DeviceMasterService,
    private readonly apiWaterPumpService: ApiWaterPumpService,
    private readonly deviceWaterPumpService: DeviceWaterPumpService,
  ) {}
  /**
   * Todo: Extract Controller */
  @MessagePattern(ESlaveState.WATER_PUMP, Transport.TCP)
  async getWaterPumpState(
    @Payload() waterPumpStateDto: WaterPumpStateDto,
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
   * Todo: Extract to service */
  /**
   * Todo: LED, 모터 둘다 포함 가능하게 고민*/
  @MessagePattern(ESlaveTurnPowerTopic.WATER_PUMP, Transport.TCP)
  async turnWaterPump(@Payload() waterPumpTurnDto: WaterPowerTurnDto) {
    let configs: Slave | undefined;
    try {
      console.log(`turn water dto: `, waterPumpTurnDto);

      if (waterPumpTurnDto.powerState === EPowerState.ON) {
        configs = await this.deviceMasterService.getConfigs(
          waterPumpTurnDto.masterId,
          waterPumpTurnDto.slaveId,
        );
        await this.deviceWaterPumpService.requestWaterPump({
          masterId: waterPumpTurnDto.masterId,
          slaveId: waterPumpTurnDto.slaveId,
          ...configs,
        });
      } else {
        /* Turn Off */
        await this.deviceWaterPumpService.turnWaterPump(waterPumpTurnDto);
      }

      const runningStateKey = SensorStateKey({
        sensor: ESlaveState.WATER_PUMP,
        masterId: waterPumpTurnDto.masterId,
        slaveId: waterPumpTurnDto.slaveId,
      });
      const powerStateKey = SensorPowerKey({
        sensor: ESlaveTurnPowerTopic.WATER_PUMP,
        masterId: waterPumpTurnDto.masterId,
        slaveId: waterPumpTurnDto.slaveId,
      });
      const cacheRunningState = this.cacheManager.set<string>(
        runningStateKey,
        waterPumpTurnDto.powerState,
        {
          ttl: configs?.waterPumpRuntime ? configs.waterPumpRuntime * 60 : 0,
        },
      );
      const cachePowerState = this.cacheManager.set<string>(
        powerStateKey,
        waterPumpTurnDto.powerState,
        { ttl: 0 },
      );

      Promise.allSettled([cacheRunningState, cachePowerState]);

      return {
        status: HttpStatus.OK,
        topic: ESlaveTurnPowerTopic.WATER_PUMP,
        message: 'send turn water pump packet to device',
        data: waterPumpTurnDto.powerState,
      };
    } catch (e) {
      console.log(`catch water pump config error`, e);
      return e;
    }
  }

  /** Todo: Extract service */
  @MessagePattern(ESlaveConfigTopic.WATER_PUMP, Transport.TCP)
  async setWaterPumpConfig(
    @Payload() waterPumpConfigDto: SlaveConfigDto,
  ): Promise<ResponseStatus> {
    try {
      console.log(`call set waterpump config`, waterPumpConfigDto);

      const waterPumpPacket =
        await this.deviceWaterPumpService.requestWaterPump(waterPumpConfigDto);

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
        data: waterPumpPacket,
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
