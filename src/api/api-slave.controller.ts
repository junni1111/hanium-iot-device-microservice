import { CACHE_MANAGER, Controller, HttpStatus, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { DeviceService } from '../device/device.service';
import { DevicePollingService } from '../device/device-polling.service';
import { DeviceMasterService } from '../device/device-master.service';
import { ResponseStatus } from '../device/interfaces/response-status';
import {
  ESlaveConfigTopic,
  ESlaveState,
  ESlaveTurnPowerTopic,
  TEMPERATURE_WEEK,
} from '../util/constants/api-topic';
import { TEMPERATURE } from '../util/constants/mqtt-topic';
import { DeviceLedService } from '../device/device-led.service';
import { DeviceWaterPumpService } from '../device/device-water-pump.service';
import { DeviceTemperatureService } from '../device/device-temperature.service';
import { LedTurnDto } from './dto/led/led-turn.dto';
import { WaterPumpTurnDto } from './dto/water-pump/water-pump-turn.dto';
import { LedStateDto } from './dto/led/led-state.dto';
import { Cache } from 'cache-manager';
import { WaterPumpStateDto } from './dto/water-pump/water-pump-state.dto';
import { ApiLedService } from './api-led.service';
import { ApiWaterPumpService } from './api-water-pump.service';
import { SlaveStateDto } from './dto/slave/slave-state.dto';
import { SlaveConfigDto } from './dto/slave/slave-config.dto';

@Controller()
export class ApiSlaveController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly masterService: DeviceMasterService,
    private readonly pollingService: DevicePollingService,
    private readonly apiLedService: ApiLedService,
    private readonly apiWaterPumpService: ApiWaterPumpService,
    private readonly deviceService: DeviceService,
    private readonly deviceLedService: DeviceLedService,
    private readonly deviceWaterPumpService: DeviceWaterPumpService,
    private readonly deviceTemperatureService: DeviceTemperatureService,
  ) {}

  /** Todo: 센서들 상태 캐싱값 받아와서 돌려줌 */
  @MessagePattern(ESlaveState.ALL, Transport.TCP)
  async getSlaveState(
    @Payload() slaveStateDto: SlaveStateDto,
  ): Promise<ResponseStatus> {
    try {
      /* TODO: Validate master id & slave id */
      console.log(`call Slave State`, slaveStateDto);
      console.log(`mid, sid:`, slaveStateDto.masterId, slaveStateDto.slaveId);

      const ledState = await this.apiLedService.getLedState(slaveStateDto);
      const waterPumpState = await this.apiWaterPumpService.getWaterPumpState(
        slaveStateDto,
      );

      console.log(`led State: `, ledState);

      console.log(`waterPumpState: `, waterPumpState);

      return {
        status: HttpStatus.OK,
        topic: ESlaveState.ALL,
        message: 'request check slave state success',
        data: { ledState, waterPumpState },
      };
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Todo: Extract Controller */
  @MessagePattern(ESlaveState.WATER_PUMP, Transport.TCP)
  async getWaterPumpState(
    @Payload() waterPumpStateDto: WaterPumpStateDto,
  ): Promise<ResponseStatus> {
    try {
      const state = await this.apiWaterPumpService.getWaterPumpState(
        waterPumpStateDto,
      );

      return {
        status: HttpStatus.OK,
        topic: ESlaveState.WATER_PUMP,
        message: 'request check water pump state success',
        data: state,
      };
    } catch (e) {
      console.log(e);
    }
  }
  /**
   * Todo: Extract Controller */
  @MessagePattern(ESlaveState.LED, Transport.TCP)
  async getLedState(
    @Payload() ledStateDto: LedStateDto,
  ): Promise<ResponseStatus> {
    try {
      console.log(`led dto: `, ledStateDto);
      console.log(`led mid ,sid : `, ledStateDto.masterId, ledStateDto.slaveId);
      const state = await this.apiLedService.getLedState(ledStateDto);

      return {
        status: HttpStatus.OK,
        topic: ESlaveState.LED,
        message: 'request check led state success',
        data: state,
      };
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Todo: LED, 모터 둘다 포함 가능하게 고민*/
  @MessagePattern(ESlaveTurnPowerTopic.WATER_PUMP, Transport.TCP)
  async turnWaterPump(@Payload() waterPumpTurnDto: WaterPumpTurnDto) {
    try {
      const requestResult = await this.deviceWaterPumpService.turnWaterPump(
        waterPumpTurnDto,
      );
      /** Todo: Extract Service */
      const key = `master/${waterPumpTurnDto.masterId}/slave/${waterPumpTurnDto.slaveId}/${ESlaveState.WATER_PUMP}`;
      const state = await this.cacheManager.set<string>(
        key,
        waterPumpTurnDto.powerState,
        { ttl: 0 },
      );

      return {
        status: HttpStatus.OK,
        topic: ESlaveTurnPowerTopic.WATER_PUMP,
        message: 'send turn water pump packet to device',
        data: requestResult,
      };
    } catch (e) {
      console.log(`catch led config error`, e);
      return e;
    }
  }

  /**
   * Todo: LED, 모터 둘다 포함 가능하게 고민*/
  @MessagePattern(ESlaveTurnPowerTopic.LED, Transport.TCP)
  async turnLed(@Payload() ledTurnDto: LedTurnDto) {
    try {
      const requestResult = await this.deviceLedService.turnLed(ledTurnDto);

      /** Todo: Extract Service */
      const key = `master/${ledTurnDto.masterId}/slave/${ledTurnDto.slaveId}/${ESlaveState.LED}`;

      const state = await this.cacheManager.set<string>(
        key,
        ledTurnDto.powerState,
        { ttl: 0 },
      );

      return {
        status: HttpStatus.OK,
        topic: ESlaveTurnPowerTopic.LED,
        message: 'send turn led packet to device',
        data: requestResult,
      };
    } catch (e) {
      console.log(`catch led config error`, e);
      return e;
    }
  }

  @MessagePattern(ESlaveConfigTopic.ALL, Transport.TCP)
  async fetchConfig(@Payload() { masterId, slaveId }: Partial<SlaveConfigDto>) {
    try {
      const result = await this.masterService.getConfigs(masterId, slaveId);
      console.log(result);
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  @MessagePattern(ESlaveConfigTopic.LED, Transport.TCP)
  async setLedConfig(@Payload() ledConfigDto: SlaveConfigDto) {
    console.log(`call set led config`, ledConfigDto);

    try {
      const requestResult = this.deviceLedService.requestLed(ledConfigDto);
      /** Todo: Extract to service */
      if (ledConfigDto.ledRuntime > 0) {
        const key = `master/${ledConfigDto.masterId}/slave/${ledConfigDto.slaveId}/${ESlaveState.LED}`;
        await this.cacheManager.set<string>(key, 'on', {
          ttl: ledConfigDto.ledRuntime * 60,
        });
        console.log(`led runtime: `, ledConfigDto.ledRuntime);
      }

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

      return {
        status: HttpStatus.OK,
        topic: ESlaveConfigTopic.LED,
        message: 'send led packet to device',
        data: requestResult,
      };
    } catch (e) {
      console.log(`catch led config error`, e);
      return e;
    }
  }

  @MessagePattern(ESlaveConfigTopic.TEMPERATURE, Transport.TCP)
  async setTemperatureConfig(@Payload() temperatureConfigDto: SlaveConfigDto) {
    const requestResult = this.deviceTemperatureService.requestTemperature(
      temperatureConfigDto.masterId,
      temperatureConfigDto.slaveId,
    );

    const configUpdateResult =
      await this.deviceTemperatureService.setTemperatureConfig(
        temperatureConfigDto,
      );

    if (!configUpdateResult.affected) {
      return {
        status: HttpStatus.BAD_REQUEST,
        topic: ESlaveConfigTopic.TEMPERATURE,
        message: 'temperature config not affected',
        data: configUpdateResult,
      };
    }

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
      console.log(`call set waterpump config`, waterPumpConfigDto);

      const waterPumpPacket =
        await this.deviceWaterPumpService.requestWaterPump(waterPumpConfigDto);

      if (waterPumpConfigDto.waterPumpRuntime > 0) {
        const key = `master/${waterPumpConfigDto.masterId}/slave/${waterPumpConfigDto.slaveId}/${ESlaveState.WATER_PUMP}`;
        await this.cacheManager.set<string>(key, 'on', {
          ttl: waterPumpConfigDto.waterPumpRuntime * 60,
        });
      }

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
      /* Todo: Change to DTO */
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

  /* Todo: Change topic */
  @MessagePattern('temperature/now', Transport.TCP)
  async getCurrentTemperature(
    @Payload() payload: string,
  ): Promise<ResponseStatus> {
    /* Todo: Change to DTO */
    const { master_id, slave_id } = JSON.parse(payload);
    const data = await this.deviceTemperatureService.getCurrentTemperature(
      parseInt(master_id),
      parseInt(slave_id),
    );

    // console.log(`current temp:`, data);
    return {
      status: HttpStatus.OK,
      topic: 'temperature',
      message: 'success fetch current temperature',
      data,
    };
  }
  //
  // @MessagePattern(TEMPERATURE, Transport.TCP)
  // async publishTemperature(
  //   @Payload() payload: string,
  // ): Promise<ResponseStatus> {
  //   try {
  //     const { master_id, slave_id } = JSON.parse(payload);
  //     return this.deviceTemperatureService.requestTemperature(
  //       parseInt(master_id),
  //       parseInt(slave_id),
  //     );
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
}
