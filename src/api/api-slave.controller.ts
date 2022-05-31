import { CACHE_MANAGER, Controller, HttpStatus, Inject } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { DeviceService } from '../device/device.service';
import { DevicePollingService } from '../device/device-polling.service';
import { DeviceMasterService } from '../device/device-master.service';
import { ResponseStatus } from '../device/interfaces/response-status';
import {
  EPowerState,
  ESlaveConfigTopic,
  ESlaveState,
  ESlaveTurnPowerTopic,
  TEMPERATURE_WEEK,
} from '../util/constants/api-topic';
import { DeviceLedService } from '../device/device-led.service';
import { DeviceWaterPumpService } from '../device/device-water-pump.service';
import { DeviceTemperatureService } from '../device/device-temperature.service';
import { LedPowerDto } from './dto/led/led-power.dto';
import { WaterPowerTurnDto } from './dto/water-pump/water-power-turn.dto';
import { LedStateDto } from './dto/led/led-state.dto';
import { Cache } from 'cache-manager';
import { WaterPumpStateDto } from './dto/water-pump/water-pump-state.dto';
import { ApiLedService } from './api-led.service';
import { ApiWaterPumpService } from './api-water-pump.service';
import { SlaveStateDto } from './dto/slave/slave-state.dto';
import { SlaveConfigDto } from './dto/slave/slave-config.dto';
import { Slave } from '../device/entities/slave.entity';

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

      const ledRunningState = await this.apiLedService.getRunningState(
        slaveStateDto,
      );
      const ledPowerState = await this.apiLedService.getPowerState(
        slaveStateDto,
      );

      const waterPumpRunningState =
        await this.apiWaterPumpService.getRunningState(slaveStateDto);
      const waterPumpPowerState = await this.apiWaterPumpService.getPowerState(
        slaveStateDto,
      );
      console.log(`led power State: `, ledPowerState);
      console.log(`led run State: `, ledRunningState);

      console.log(`waterPump power State: `, waterPumpPowerState);
      console.log(`waterPump run State: `, waterPumpRunningState);

      return {
        status: HttpStatus.OK,
        topic: ESlaveState.ALL,
        message: 'request check slave state success',
        data: {
          ledPowerState,
          ledRunningState,
          waterPumpPowerState,
          waterPumpRunningState,
        },
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
      const state = await this.apiWaterPumpService.getRunningState(
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
      const state = await this.apiLedService.getRunningState(ledStateDto);

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
  async turnWaterPump(@Payload() waterPumpTurnDto: WaterPowerTurnDto) {
    let configs: Slave | undefined;
    try {
      console.log(`turn water dto: `, waterPumpTurnDto);

      if (waterPumpTurnDto.powerState === EPowerState.ON) {
        configs = await this.masterService.getConfigs(
          waterPumpTurnDto.masterId,
          waterPumpTurnDto.slaveId,
        );
        await this.deviceWaterPumpService.requestWaterPump({
          masterId: waterPumpTurnDto.masterId,
          slaveId: waterPumpTurnDto.slaveId,
          ...configs,
        });
      } else {
        /* Turn Off */
        await this.deviceWaterPumpService.turnWaterPump(waterPumpTurnDto);
      }

      /**
       * Todo: Extract to service */
      const runningStateKey = `master/${waterPumpTurnDto.masterId}/slave/${waterPumpTurnDto.slaveId}/${ESlaveState.WATER_PUMP}`;
      const powerStateKey = `master/${waterPumpTurnDto.masterId}/slave/${waterPumpTurnDto.slaveId}/${ESlaveTurnPowerTopic.WATER_PUMP}`;
      const cacheRunningState = this.cacheManager.set<string>(
        runningStateKey,
        waterPumpTurnDto.powerState,
        {
          ttl: configs?.ledRuntime * 60 ?? 0,
        },
      );
      const cachePowerState = this.cacheManager.set<string>(
        powerStateKey,
        waterPumpTurnDto.powerState,
        { ttl: 0 },
      );

      Promise.allSettled([cacheRunningState, cachePowerState]);

      return {
        status: HttpStatus.OK,
        topic: ESlaveTurnPowerTopic.LED,
        message: 'send turn led packet to device',
        data: waterPumpTurnDto.powerState,
      };
    } catch (e) {
      console.log(`catch led config error`, e);
      return e;
    }
  }

  /**
   * Todo: LED, 모터 둘다 포함 가능하게 고민*/
  /**
   * Todo: Extract service
   **/
  @MessagePattern(ESlaveTurnPowerTopic.LED, Transport.TCP)
  async turnLed(@Payload() ledTurnDto: LedPowerDto) {
    const runningStateKey = `master/${ledTurnDto.masterId}/slave/${ledTurnDto.slaveId}/${ESlaveState.LED}`;
    const powerStateKey = `master/${ledTurnDto.masterId}/slave/${ledTurnDto.slaveId}/${ESlaveTurnPowerTopic.LED}`;
    let configs: Slave | undefined;
    try {
      console.log(`turn led dto: `, ledTurnDto);

      if (ledTurnDto.powerState === EPowerState.ON) {
        configs = await this.masterService.getConfigs(
          ledTurnDto.masterId,
          ledTurnDto.slaveId,
        );
        await this.deviceLedService.requestLed({
          masterId: ledTurnDto.masterId,
          slaveId: ledTurnDto.slaveId,
          ...configs,
        });
      } else {
        /* Turn Off */
        await this.deviceLedService.turnLed(ledTurnDto);
      }

      const cacheRunningState = this.cacheManager.set<string>(
        runningStateKey,
        ledTurnDto.powerState,
        {
          ttl: configs?.ledRuntime * 60 ?? 0,
        },
      );
      const cachePowerState = this.cacheManager.set<string>(
        powerStateKey,
        ledTurnDto.powerState,
        { ttl: 0 },
      );

      Promise.allSettled([cacheRunningState, cachePowerState]);

      return {
        status: HttpStatus.OK,
        topic: ESlaveTurnPowerTopic.LED,
        message: 'send turn led packet to device',
        data: ledTurnDto.powerState,
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
        const powerStateKey = `master/${ledConfigDto.masterId}/slave/${ledConfigDto.slaveId}/${ESlaveTurnPowerTopic.LED}`;
        const runningStateKey = `master/${ledConfigDto.masterId}/slave/${ledConfigDto.slaveId}/${ESlaveState.LED}`;
        await this.cacheManager.set<string>(powerStateKey, 'on', { ttl: 0 });
        await this.cacheManager.set<string>(runningStateKey, 'on', {
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

  @MessagePattern(ESlaveConfigTopic.WATER_PUMP, Transport.TCP)
  async setWaterPumpConfig(
    @Payload() waterPumpConfigDto: SlaveConfigDto,
  ): Promise<ResponseStatus> {
    try {
      console.log(`call set waterpump config`, waterPumpConfigDto);

      const waterPumpPacket =
        await this.deviceWaterPumpService.requestWaterPump(waterPumpConfigDto);

      if (waterPumpConfigDto.waterPumpRuntime > 0) {
        const powerStateKey = `master/${waterPumpConfigDto.masterId}/slave/${waterPumpConfigDto.slaveId}/${ESlaveTurnPowerTopic.WATER_PUMP}`;
        await this.cacheManager.set<string>(powerStateKey, 'on', { ttl: 0 });

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

  /** Todo: Extract Controller */
  @MessagePattern(ESlaveConfigTopic.TEMPERATURE, Transport.TCP)
  async setTemperatureConfig(@Payload() temperatureConfigDto: SlaveConfigDto) {
    console.log(`call set temperature config`, temperatureConfigDto);
    /** Todo: Change Key */
    const temperatureRangeKey = `master/${temperatureConfigDto.masterId}/slave/${temperatureConfigDto.slaveId}/${ESlaveConfigTopic.TEMPERATURE}`;
    try {
      /**
       * Todo: 현재 redis에 캐싱되어있는 온도 범위와 비교
       *       값이 다르다면 db에 저장 */
      // const cachedTemperatureRange = await this.cacheManager.get<number[]>(
      //   temperatureRangeKey,
      // );
      // console.log(`before cached range: `, cachedTemperatureRange);

      const configUpdateResult =
        await this.deviceTemperatureService.setTemperatureConfig(
          temperatureConfigDto,
        );

      if (!configUpdateResult.affected) {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          topic: ESlaveConfigTopic.TEMPERATURE,
          message: 'temperature config not affected',
          data: configUpdateResult,
        };
      }

      /** Todo: 범위 값 저장 방식 고민 */
      const cachedResult = await this.cacheManager.set<number[]>(
        temperatureRangeKey,
        [
          temperatureConfigDto.startTemperatureRange,
          temperatureConfigDto.endTemperatureRange,
        ],
        { ttl: 3600 },
      );

      return {
        status: HttpStatus.OK,
        topic: ESlaveConfigTopic.TEMPERATURE,
        message: 'success to save temperature config',
        data: cachedResult,
      };
    } catch (e) {
      console.log(`catch led config error`, e);
      return e;
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
}
