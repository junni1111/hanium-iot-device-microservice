import {
  Body,
  CACHE_MANAGER,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Post,
  Query,
} from '@nestjs/common';
import { DevicePollingService } from '../../device/device-polling.service';
import { ResponseStatus } from '../../device/interfaces/response-status';
import { ESlaveState } from '../../util/constants/api-topic';
import { Cache } from 'cache-manager';
import { SlaveStateDto } from '../dto/slave/slave-state.dto';
import { ApiSlaveService } from './api-slave.service';
import { DeviceSlaveService } from '../../device/slave/device-slave.service';
import { CreateSlaveDto } from '../dto/slave/create-slave.dto';
import { ApiTags } from '@nestjs/swagger';
import { SLAVE } from '../../util/constants/swagger';

@ApiTags(SLAVE)
@Controller('slave')
export class ApiSlaveController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    // private readonly masterService: DeviceMasterService,
    private slaveService: DeviceSlaveService,
    private readonly pollingService: DevicePollingService,
    private readonly apiSlaveService: ApiSlaveService,
  ) {}

  @Post('')
  async createSlave(
    @Body() createSlaveDto: CreateSlaveDto,
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

  @Get('config')
  async fetchConfig(
    @Query('masterId') masterId: number,
    @Query('slaveId') slaveId: number,
  ) {
    try {
      /** Todo: Convert configs to camelCase */
      const result = await this.slaveService.getConfigs(masterId, slaveId);
      console.log(result);
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  /** Todo: 센서들 상태 캐싱값 받아와서 돌려줌 */
  @Post('state')
  async getSlaveState(
    @Body() slaveStateDto: SlaveStateDto,
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

  @Delete('db')
  clearSlaveDB() {
    return this.slaveService.clearSlaveDB();
  }
}
