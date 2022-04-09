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
export class ApiSlaveController {
  constructor(
    private readonly masterService: DeviceMasterService,
    private readonly pollingService: DevicePollingService,
    private readonly deviceService: DeviceService,
    private readonly deviceLedService: DeviceLedService,
    private readonly deviceWaterPumpService: DeviceWaterPumpService,
    private readonly deviceTemperatureService: DeviceTemperatureService,
  ) {}

  @MessagePattern('slave/state', Transport.TCP)
  async getSlaveState(@Payload() payload: string): Promise<ResponseStatus> {
    try {
      const { master_id, slave_id } = JSON.parse(payload);
      /* TODO: Validate master id & slave id */
      console.log(`call Slave State`, master_id, slave_id);

      await this.deviceLedService.checkLedState(master_id, slave_id);
      await this.deviceWaterPumpService.checkWaterPumpState(
        master_id,
        slave_id,
      );
      return {
        status: HttpStatus.OK,
        topic: 'slave/state',
        message: 'request check slave state success',
      };
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
    const configUpdateResult = await this.deviceLedService.setLedConfig(
      ledConfigDto,
    );

    if (!configUpdateResult.affected) {
      return {
        status: HttpStatus.BAD_REQUEST,
        topic: ESlaveConfigTopic.LED,
        message: 'led config not affected',
        data: configUpdateResult,
      };
    }

    const requestResult = this.deviceLedService.requestLed(ledConfigDto);

    return {
      status: HttpStatus.OK,
      topic: ESlaveConfigTopic.TEMPERATURE,
      message: 'send led packet to device',
      data: requestResult,
    };
  }

  @MessagePattern(ESlaveConfigTopic.TEMPERATURE, Transport.TCP)
  async setTemperatureConfig(@Payload() temperatureConfigDto: SlaveConfigDto) {
    const configUpdateResult =
      await this.deviceTemperatureService.setTemperatureConfig(
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
      const configUpdateResult =
        await this.deviceWaterPumpService.setWaterPumpConfig(
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
        parseInt(master_id),
        parseInt(slave_id),
      );
    } catch (e) {
      console.log(e);
    }
  }
}
