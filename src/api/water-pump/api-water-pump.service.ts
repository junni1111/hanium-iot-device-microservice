import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

export class ApiWaterPumpService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}
}
