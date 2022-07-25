import { CACHE_MANAGER, Controller, HttpStatus, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { DevicePollingService } from '../../device/device-polling.service';
import { DeviceMasterService } from '../../device/master/device-master.service';
import { ResponseStatus } from '../../device/interfaces/response-status';
import { ESlaveConfigTopic, ESlaveState } from '../../util/constants/api-topic';
import { Cache } from 'cache-manager';
import { SlaveStateDto } from '../dto/slave/slave-state.dto';
import { SlaveConfigDto } from '../dto/slave/slave-config.dto';
import { ApiSlaveService } from './api-slave.service';
import { DeviceSlaveService } from '../../device/slave/device-slave.service';

@Controller()
export class ApiSlaveController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    // private readonly masterService: DeviceMasterService,
    private slaveService: DeviceSlaveService,
    private readonly pollingService: DevicePollingService,
    private readonly apiSlaveService: ApiSlaveService,
  ) {}

  /** Todo: 센서들 상태 캐싱값 받아와서 돌려줌 */
  @MessagePattern(ESlaveState.ALL, Transport.TCP)
  async getSlaveState(
    @Payload() slaveStateDto: SlaveStateDto,
  ): Promise<ResponseStatus> {
    try {
      /* TODO: Validate master id & slave id */

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
      /** Todo: Convert configs to camelCase */
      const result = await this.slaveService.getConfigs(masterId, slaveId);
      console.log(result);
      return result;
    } catch (e) {
      console.log(e);
    }
  }
}
