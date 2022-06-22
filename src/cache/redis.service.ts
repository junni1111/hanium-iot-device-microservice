import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getKeysCache(key: string): Promise<string[]> {
    const result: string[] = await this.cacheManager.store.keys<string[]>(key);
    return result;
  }

  async getValueCache(key: string): Promise<string> {
    const result: string = await this.cacheManager.get<string>(key);
    return result;
  }
}
