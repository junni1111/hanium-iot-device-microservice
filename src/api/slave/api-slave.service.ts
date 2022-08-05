import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  EPowerState,
  ESlaveState,
  ESlaveTurnPowerTopic,
} from '../../util/constants/api-topic';
import { SlaveStateDto } from './dto/slave-state.dto';
import { SensorStateDto } from './dto/sensor-state.dto';
import { SensorPowerKey, SensorStateKey } from '../../util/key-generator';

export class ApiSlaveService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getSensorsState(slaveStateDto: SlaveStateDto): Promise<SensorStateDto> {
    const waterPumpRunningState = await this.getRunningState(
      slaveStateDto,
      ESlaveState.WATER_PUMP,
    );
    const ledRunningState = await this.getRunningState(
      slaveStateDto,
      ESlaveState.LED,
    );
    const fanRunningState = await this.getRunningState(
      slaveStateDto,
      ESlaveState.FAN,
    );
    const waterPumpPowerState = await this.getPowerState(
      slaveStateDto,
      ESlaveTurnPowerTopic.WATER_PUMP,
    );
    const ledPowerState = await this.getPowerState(
      slaveStateDto,
      ESlaveTurnPowerTopic.LED,
    );
    const fanPowerState = await this.getPowerState(
      slaveStateDto,
      ESlaveTurnPowerTopic.FAN,
    );

    /** Todo: Exception handling */
    return {
      waterPumpRunningState,
      waterPumpPowerState,
      ledRunningState,
      ledPowerState,
      fanRunningState,
      fanPowerState,
    };
  }

  async getRunningState(
    { masterId, slaveId }: SlaveStateDto,
    sensor: ESlaveState,
  ) {
    const key = SensorStateKey({ sensor, masterId, slaveId });
    return await this.cacheManager.get<EPowerState>(key);
  }

  async getPowerState(
    { masterId, slaveId }: SlaveStateDto,
    sensor: ESlaveTurnPowerTopic,
  ) {
    const key = SensorPowerKey({ sensor, masterId, slaveId });
    return this.cacheManager.get<EPowerState>(key);
  }
}
