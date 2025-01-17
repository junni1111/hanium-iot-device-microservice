import {
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
import { Cache } from 'cache-manager';
import { ApiSlaveService } from '../slave/api-slave.service';
import { SensorPowerKey, SensorStateKey } from '../../util/key-generator';
import { DeviceFanService } from '../../device/fan/device-fan.service';
import { ApiTags } from '@nestjs/swagger';
import { FAN } from '../../util/constants/swagger';
import { FanPowerDto } from './dto/fan-power.dto';

@ApiTags(FAN)
@Controller('fan')
export class ApiFanController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly deviceMasterService: DeviceMasterService,
    private readonly apiSlaveService: ApiSlaveService,
    private readonly deviceFanService: DeviceFanService,
  ) {}

  @Post('power')
  async turnFan(@Body() fanPowerDto: FanPowerDto) {
    console.log(`@@@@@@ TURN FAN`, fanPowerDto);
    const powerStateKey = SensorPowerKey({
      sensor: ESlaveTurnPowerTopic.FAN,
      masterId: fanPowerDto.masterId,
      slaveId: fanPowerDto.slaveId,
    });

    try {
      if (fanPowerDto.powerState === EPowerState.OFF) {
        await this.deviceFanService.mockTurnOff({
          masterId: fanPowerDto.masterId,
          slaveId: fanPowerDto.slaveId,
        });

        const runningStateKey = SensorStateKey({
          sensor: ESlaveState.FAN,
          masterId: fanPowerDto.masterId,
          slaveId: fanPowerDto.slaveId,
        });

        await this.cacheManager.set<string>(
          runningStateKey,
          fanPowerDto.powerState,
          { ttl: 0 },
        );
      }

      await this.cacheManager.set<string>(
        powerStateKey,
        fanPowerDto.powerState,
        { ttl: 0 },
      );

      return fanPowerDto.powerState;
    } catch (e) {
      console.log(`catch fan config error`, e);
      throw e;
    }
  }

  @Delete('db')
  clearFanDB() {
    return 'FAN NOT EXIST DB!';
  }
}
