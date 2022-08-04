import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { DevicePollingService } from '../../device/device-polling.service';
import { DeviceMasterService } from '../../device/master/device-master.service';
import { EPollingState } from '../../device/interfaces/polling-status';
import { CreateMasterDto } from './dto/create-master.dto';
import { DeviceSlaveService } from '../../device/slave/device-slave.service';
import { ApiTags } from '@nestjs/swagger';
import { MASTER } from '../../util/constants/swagger';

@ApiTags(MASTER)
@Controller('master')
export class ApiMasterController {
  constructor(
    private readonly masterService: DeviceMasterService,
    private readonly slaveService: DeviceSlaveService,
    private readonly pollingService: DevicePollingService,
  ) {}

  @Post()
  async createMaster(@Body() createMasterDto: CreateMasterDto) {
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

  /**
   * Todo: Refactor To Better Status Code */
  @Get('polling')
  async getPollingState(@Query('masterId') masterId: string) {
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

  @Delete('db')
  clearMasterDB() {
    return this.masterService.clearMasterDB();
  }
}
