import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  ESlaveState,
  ESlaveTurnPowerTopic,
} from '../../util/constants/api-topic';
import { WaterPumpStateDto } from '../dto/water-pump/water-pump-state.dto';

export class ApiWaterPumpService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}
}
