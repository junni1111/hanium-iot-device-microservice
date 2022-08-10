import {
  BadRequestException,
  Body,
  CACHE_MANAGER,
  Controller,
  Delete,
  Inject,
  Post,
} from '@nestjs/common';
import { DeviceMasterService } from '../../device/master/device-master.service';
import {
  EPowerState,
  ESlaveState,
  ESlaveTurnPowerTopic,
} from '../../util/constants/api-topic';
import { DeviceLedService } from '../../device/led/device-led.service';
import { LedPowerDto } from './dto/led-power.dto';
import { LedStateDto } from './dto/led-state.dto';
import { Cache } from 'cache-manager';
import { ApiLedService } from './api-led.service';
import { ApiSlaveService } from '../slave/api-slave.service';
import { SensorPowerKey, SensorStateKey } from '../../util/key-generator';
import { ILedConfig } from '../../device/interfaces/slave-configs';
import { ApiTags } from '@nestjs/swagger';
import { LED } from '../../util/constants/swagger';
import { LedConfigDto } from './dto/led-config.dto';

@ApiTags(LED)
@Controller('led')
export class ApiLedController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly deviceMasterService: DeviceMasterService,
    private readonly apiSlaveService: ApiSlaveService,
    private readonly apiLedService: ApiLedService,
    private readonly deviceLedService: DeviceLedService,
  ) {}

  @Post('config')
  async setLedConfig(@Body() ledConfigDto: LedConfigDto) {
    try {
      const requestResult = this.deviceLedService.requestLed(ledConfigDto);
      /** Todo: Extract to service */
      if (ledConfigDto.ledRuntime > 0) {
        const powerStateKey = SensorPowerKey({
          sensor: ESlaveTurnPowerTopic.LED,
          masterId: ledConfigDto.masterId,
          slaveId: ledConfigDto.slaveId,
        });
        const runningStateKey = SensorStateKey({
          sensor: ESlaveState.LED,
          masterId: ledConfigDto.masterId,
          slaveId: ledConfigDto.slaveId,
        });
        await this.cacheManager.set<string>(powerStateKey, 'on', { ttl: 0 });
        await this.cacheManager.set<string>(runningStateKey, 'on', {
          ttl: ledConfigDto.ledRuntime * 60,
        });
        console.log(`led runtime: `, ledConfigDto.ledRuntime);
      }

      const configUpdateResult = await this.deviceLedService.setConfig(
        ledConfigDto,
      );

      if (!configUpdateResult) {
        throw new BadRequestException('led config not affected');
      }
      console.log(`LED Config`);

      return 'ok';
    } catch (e) {
      console.log(`catch led config error`, e);
      throw e;
    }
  }

  @Post('state')
  async getLedState(@Body() ledStateDto: LedStateDto) {
    console.log(`led state!`);
    try {
      const state = await this.apiSlaveService.getRunningState(
        ledStateDto,
        ESlaveState.LED,
      );

      return state;
    } catch (e) {
      console.log('catch led state error', e);
      throw e;
    }
  }

  /**
   * Todo: LED, 모터 둘다 포함 가능하게 고민*/
  @Post('power')
  async turnLed(@Body() ledTurnDto: LedPowerDto) {
    const runningStateKey = SensorStateKey({
      sensor: ESlaveState.LED,
      masterId: ledTurnDto.masterId,
      slaveId: ledTurnDto.slaveId,
    });
    const powerStateKey = SensorPowerKey({
      sensor: ESlaveTurnPowerTopic.LED,
      masterId: ledTurnDto.masterId,
      slaveId: ledTurnDto.slaveId,
    });

    let configs: ILedConfig | undefined;
    try {
      console.log(`turn led dto: `, ledTurnDto);

      if (ledTurnDto.powerState === EPowerState.ON) {
        configs = await this.deviceLedService.getConfig(
          ledTurnDto.masterId,
          ledTurnDto.slaveId,
        );

        await this.deviceLedService.requestLed({
          masterId: ledTurnDto.masterId,
          slaveId: ledTurnDto.slaveId,
          ...configs,
        });
      } else {
        /* Turn Off */
        await this.deviceLedService.turnLed(ledTurnDto);
      }

      const cacheRunningState = this.cacheManager.set<string>(
        runningStateKey,
        ledTurnDto.powerState,
        {
          ttl: configs?.ledRuntime ? configs.ledRuntime * 60 : 0,
        },
      );
      const cachePowerState = this.cacheManager.set<string>(
        powerStateKey,
        ledTurnDto.powerState,
        { ttl: 0 },
      );

      Promise.allSettled([cacheRunningState, cachePowerState]);

      return ledTurnDto.powerState;
    } catch (e) {
      console.log(`catch led config error`, e);
      throw e;
    }
  }

  @Delete('db')
  clearLedDB() {
    return this.deviceLedService.clearLedDB();
  }
}
