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
import { POLLING, TEMPERATURE, WATER_PUMP } from '../util/constants/mqtt-topic';
import { EPollingState } from '../device/interfaces/polling-status';
import { DeviceMessageDto } from './dto/device-message.dto';
import { SlaveConfigDto } from './dto/slave-config.dto';
import { DeviceLedService } from '../device/device-led.service';
import { DeviceWaterPumpService } from '../device/device-water-pump.service';
import { DeviceTemperatureService } from '../device/device-temperature.service';
import { CreateMasterDto } from './dto/create-master.dto';
import { CreateSlaveDto } from './dto/create-slave.dto';

@Controller()
export class ApiController {
  constructor(
    private readonly masterService: DeviceMasterService,
    private readonly pollingService: DevicePollingService,
    private readonly deviceService: DeviceService,
    private readonly deviceLedService: DeviceLedService,
    private readonly deviceWaterPumpService: DeviceWaterPumpService,
    private readonly deviceTemperatureService: DeviceTemperatureService,
  ) {}
  //
  // @MessagePattern('test', Transport.TCP)
  // test(@Payload() dto: SlaveConfigDto) {
  //   try {
  //     console.log(dto);
  //
  //     const ledPacket = this.deviceLedService.requestLed(dto);
  //
  //     return {
  //       status: HttpStatus.OK,
  //       topic: ESlaveConfigTopic.TEMPERATURE,
  //       message: 'send temperature packet to device',
  //       data: ledPacket,
  //     };
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  @MessagePattern('slave/state', Transport.TCP)
  getSlaveState(@Payload() payload: string) {
    try {
      const { master_id, slave_id } = JSON.parse(payload);
      console.log(`call Slave State`);

      // return this.deviceService.checkSlaveState(
      //   parseInt(master_id, 16),
      //   parseInt(slave_id, 16),
      // );
    } catch (e) {
      console.log(e);
    }
  }

  @MessagePattern(ESlaveConfigTopic.ALL, Transport.TCP)
  async fetchConfig(@Payload() payload: string) {
    try {
      const { master_id, slave_id } = JSON.parse(payload);
      console.log(`call config message`, master_id, slave_id);

      const result = await this.masterService.getConfigs(master_id, slave_id);
      console.log(result);
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  @MessagePattern(ESlaveConfigTopic.LED, Transport.TCP)
  async setLedConfig(@Payload() ledConfigDto: SlaveConfigDto) {
    const configUpdateResult = await this.masterService.setLedConfig(
      ledConfigDto,
    );
    const ledPacket = this.deviceLedService.requestLed(ledConfigDto);

    if (!configUpdateResult.affected) {
      return {
        status: HttpStatus.BAD_REQUEST,
        topic: ESlaveConfigTopic.LED,
        message: 'led config not affected',
        data: configUpdateResult,
      };
    }

    return {
      status: HttpStatus.OK,
      topic: ESlaveConfigTopic.TEMPERATURE,
      message: 'send temperature packet to device',
      data: ledPacket,
    };
  }

  @MessagePattern(ESlaveConfigTopic.TEMPERATURE, Transport.TCP)
  async setTemperatureConfig(@Payload() temperatureConfigDto: SlaveConfigDto) {
    const configUpdateResult = await this.masterService.setTemperatureConfig(
      temperatureConfigDto,
    );

    if (!configUpdateResult.affected) {
      return {
        status: HttpStatus.BAD_REQUEST,
        topic: ESlaveConfigTopic.WATER_PUMP,
        message: 'temperature config not affected',
        data: configUpdateResult,
      };
    }

    const requestResult = this.deviceTemperatureService.requestTemperature(
      temperatureConfigDto.masterId,
      temperatureConfigDto.slaveId,
    );

    return {
      status: HttpStatus.OK,
      topic: ESlaveConfigTopic.TEMPERATURE,
      message: 'send temperature packet to device',
      data: requestResult,
    };
  }
  catch(e) {
    console.log(e);
    throw e;
  }

  @MessagePattern(ESlaveConfigTopic.WATER_PUMP, Transport.TCP)
  async setWaterPumpConfig(
    @Payload() waterPumpConfigDto: SlaveConfigDto,
  ): Promise<ResponseStatus> {
    try {
      const configUpdateResult = await this.masterService.setWaterPumpConfig(
        waterPumpConfigDto,
      );

      if (!configUpdateResult.affected) {
        return {
          status: HttpStatus.BAD_REQUEST,
          topic: ESlaveConfigTopic.WATER_PUMP,
          message: 'water pump config not affected',
          data: configUpdateResult,
        };
      }

      const waterPumpPacket =
        await this.deviceWaterPumpService.requestWaterPump(waterPumpConfigDto);

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

  @MessagePattern('create/master', Transport.TCP)
  async createMaster(
    @Payload() createMasterDto: CreateMasterDto,
  ): Promise<ResponseStatus> {
    try {
      console.log(createMasterDto);
      const result = await this.masterService.createMaster(createMasterDto);

      return {
        status: HttpStatus.OK,
        topic: 'master',
        message: 'master create success',
        data: result,
      };
    } catch (e) {
      console.log(e);
    }
  }

  @MessagePattern('create/slave', Transport.TCP)
  async createSlave(
    @Payload() createSlaveDto: CreateSlaveDto,
  ): Promise<ResponseStatus> {
    try {
      const result = await this.masterService.createSlave(createSlaveDto);

      // const optimized = await this.masterService.optimize(master_id, slave_id);
      return {
        status: HttpStatus.OK,
        topic: 'slave',
        message: 'slave create success',
        data: result,
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
      console.log(result);
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  @MessagePattern(TEMPERATURE_WEEK, Transport.TCP)
  async fetchTemperatureOneWeek(
    @Payload() payload: string,
  ): Promise<ResponseStatus> {
    try {
      const { master_id, slave_id } = JSON.parse(payload);
      const data = await this.deviceTemperatureService.fetchTemperature(
        master_id,
        slave_id,
      );

      return {
        status: HttpStatus.OK,
        topic: TEMPERATURE_WEEK,
        message: 'success',
        data,
      };
    } catch (e) {
      console.log(e);
    }
  }

  @MessagePattern(TEMPERATURE, Transport.TCP)
  async publishTemperature(
    @Payload() payload: string,
  ): Promise<ResponseStatus> {
    try {
      const { master_id, slave_id } = JSON.parse(payload);
      return this.deviceTemperatureService.requestTemperature(
        parseInt(master_id, 16),
        parseInt(slave_id, 16),
      );
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
