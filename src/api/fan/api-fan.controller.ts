import { CACHE_MANAGER, Controller, HttpStatus, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { DeviceMasterService } from '../../device/master/device-master.service';
import {
  EPowerState,
  ESlaveTurnPowerTopic,
} from '../../util/constants/api-topic';
import { Cache } from 'cache-manager';
import { ApiSlaveService } from '../slave/api-slave.service';
import { SensorPowerKey } from '../../util/key-generator';
import { DeviceFanService } from '../../device/fan/device-fan.service';
import { SlavePowerDto } from '../dto/slave/slave-power.dto';

@Controller()
export class ApiFanController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly deviceMasterService: DeviceMasterService,
    private readonly apiSlaveService: ApiSlaveService,
    private readonly deviceFanService: DeviceFanService,
  ) {}

  @MessagePattern(ESlaveTurnPowerTopic.FAN, Transport.TCP)
  async turnFan(@Payload() fanPowerDto: SlavePowerDto) {
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
      }

      await this.cacheManager.set<string>(
        powerStateKey,
        fanPowerDto.powerState,
        { ttl: 0 },
      );

      return {
        status: HttpStatus.OK,
        topic: ESlaveTurnPowerTopic.FAN,
        message: 'send turn fan packet to device',
        data: fanPowerDto.powerState,
      };
    } catch (e) {
      console.log(`catch fan config error`, e);
      return e;
    }
  }
}
