import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  ESlaveState,
  ESlaveTurnPowerTopic,
} from '../../util/constants/api-topic';
import { WaterPumpStateDto } from '../dto/water-pump/water-pump-state.dto';

export class ApiWaterPumpService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getRunningState({ masterId, slaveId }: WaterPumpStateDto) {
    const key = `master/${masterId}/slave/${slaveId}/${ESlaveState.WATER_PUMP}`;

    console.log(`water key: `, key);
    return this.cacheManager.get<string>(key);
  }

  async getPowerState({ masterId, slaveId }: WaterPumpStateDto) {
    const key = `master/${masterId}/slave/${slaveId}/${ESlaveTurnPowerTopic.WATER_PUMP}`;
    return this.cacheManager.get<string>(key);
  }
}
