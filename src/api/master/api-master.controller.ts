import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { DevicePollingService } from '../../device/device-polling.service';
import { DeviceMasterService } from '../../device/master/device-master.service';
import { ResponseStatus } from '../../device/interfaces/response-status';
import { POLLING } from '../../util/constants/mqtt-topic';
import { EPollingState } from '../../device/interfaces/polling-status';
import { CreateMasterDto } from '../dto/master/create-master.dto';
import { CreateSlaveDto } from '../dto/slave/create-slave.dto';
import { DeviceSlaveService } from '../../device/slave/device-slave.service';

@Controller()
export class ApiMasterController {
  constructor(
    private readonly masterService: DeviceMasterService,
    private slaveService: DeviceSlaveService,
    private readonly pollingService: DevicePollingService,
  ) {}

  @MessagePattern('create/master', Transport.TCP)
  async createMaster(
    @Payload() createMasterDto: CreateMasterDto,
  ): Promise<ResponseStatus> {
    try {
      const createResult = await this.masterService.createMaster(
        createMasterDto,
      );

      return {
        status: HttpStatus.OK,
        topic: 'master',
        message: 'master create success',
        data: createResult,
      };
    } catch (e) {
      console.log(e);
    }
  }

  /* TODO: Extract to slave controller */
  @MessagePattern('create/slave', Transport.TCP)
  async createSlave(
    @Payload() createSlaveDto: CreateSlaveDto,
  ): Promise<ResponseStatus> {
    try {
      const createResult = await this.slaveService.createSlave(createSlaveDto);

      /* TODO: Create Optimized Value First Time */
      // const optimized = await this.masterService.optimize(master_id, slave_id);
      return {
        status: HttpStatus.OK,
        topic: 'slave',
        message: 'slave create success',
        data: createResult,
      };
    } catch (e) {
      console.log(e);
    }
  }

  // @MessagePattern('optimize', Transport.TCP)
  // async optimizeConfig(@Payload() payload: string) {
  //   try {
  //     const { master_id, slave_id } = JSON.parse(payload);
  //     const result = await this.masterService.optimize(master_id, slave_id);
  //
  //     return result;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  /**
   * Todo: Refactor To Better Status Code */
  @MessagePattern(POLLING, Transport.TCP)
  async getPollingState(@Payload() masterId: string): Promise<ResponseStatus> {
    try {
      const pollingState = await this.pollingService.getPollingState(masterId);

      switch (pollingState) {
        case EPollingState.OK:
          return {
            status: HttpStatus.OK,
            topic: 'polling',
            message: `OK. ID:${masterId}`,
          };

        case EPollingState.ERROR1:
          return {
            status: HttpStatus.BAD_REQUEST,
            topic: 'polling',
            message: `Mock Polling State Error ID:${masterId}`,
          };

        default:
          return {
            status: HttpStatus.BAD_REQUEST,
            topic: 'polling',
            message: `Mock Polling State Error ID:${masterId}`,
          };
      }
    } catch (e) {
      console.log(e);
    }
  }
}
