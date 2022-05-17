import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { LedStateDto } from './dto/led/led-state.dto';
import { ESlaveState } from '../util/constants/api-topic';

export class ApiLedService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getLedState(ledStateDto: LedStateDto) {
    const key = `master/${ledStateDto.masterId}/slave/${ledStateDto.slaveId}/${ESlaveState.LED}`;
    console.log(`led key: `, key);

    return this.cacheManager.get<string>(key);
  }
}
