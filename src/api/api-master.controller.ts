import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';

import { DeviceService } from '../device/device.service';
import { DevicePollingService } from '../device/device-polling.service';
import { DeviceMasterService } from '../device/device-master.service';
import { ResponseStatus } from '../device/interfaces/response-status';
import {
  ESlaveConfigTopic,
  TEMPERATURE_WEEK,
} from '../util/constants/api-topic';
import { POLLING, TEMPERATURE } from '../util/constants/mqtt-topic';
import { EPollingState } from '../device/interfaces/polling-status';
import { SlaveConfigDto } from './dto/slave-config.dto';
import { DeviceLedService } from '../device/device-led.service';
import { DeviceWaterPumpService } from '../device/device-water-pump.service';
import { DeviceTemperatureService } from '../device/device-temperature.service';
import { CreateMasterDto } from './dto/create-master.dto';
import { CreateSlaveDto } from './dto/create-slave.dto';

@Controller()
export class ApiMasterController {
  constructor(
    private readonly masterService: DeviceMasterService,
    private readonly pollingService: DevicePollingService,
    private readonly deviceService: DeviceService,
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
      const createResult = await this.masterService.createSlave(createSlaveDto);

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

  @MessagePattern('optimize', Transport.TCP)
  async optimizeConfig(@Payload() payload: string) {
    try {
      const { master_id, slave_id } = JSON.parse(payload);
      const result = await this.masterService.optimize(master_id, slave_id);

      return result;
    } catch (e) {
      console.log(e);
    }
  }

  @MessagePattern(POLLING, Transport.TCP)
  async getPollingState(@Payload() masterId: string): Promise<ResponseStatus> {
    try {
      const state = this.pollingService.getPollingState(parseInt(masterId));
      switch (state) {
        case EPollingState.OK:
          return {
            status: HttpStatus.OK,
            topic: 'polling',
            message: `OK. ID:${masterId}`,
          };

        case EPollingState.ERROR1:
          return {
            status: HttpStatus.GATEWAY_TIMEOUT,
            topic: 'polling',
            message: 'Fail. Error code 1',
          };

        default:
          return {
            status: HttpStatus.BAD_REQUEST,
            topic: 'polling',
            message: 'Fail. Default Error',
          };
      }
    } catch (e) {
      console.log('polling Error: ', e);
      return { status: HttpStatus.BAD_REQUEST, topic: 'polling', message: e };
    }
  }
}
