import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

export class ApiLedService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}
}
