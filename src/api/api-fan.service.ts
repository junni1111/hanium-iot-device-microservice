import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { LedStateDto } from './dto/led/led-state.dto';
import { ESlaveState, ESlaveTurnPowerTopic } from '../util/constants/api-topic';

export class ApiFanService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getRunningState({ masterId, slaveId }: LedStateDto) {
    const key = `master/${masterId}/slave/${slaveId}/${ESlaveState.LED}`;
    console.log(`led key: `, key);

    return this.cacheManager.get<string>(key);
  }

  async getPowerState({ masterId, slaveId }: LedStateDto) {
    const key = `master/${masterId}/slave/${slaveId}/${ESlaveTurnPowerTopic.LED}`;
    return this.cacheManager.get<string>(key);
  }
}
