import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { IGraphConfig } from 'src/device/interfaces/graph-config';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getKeysCache(key: string): Promise<string[]> {
    const result: string[] = await this.cacheManager.store.keys<string[]>(key);
    return result;
  }

  async getTemperatureValuesCache(key: string): Promise<IGraphConfig[]> {
    const keys: string[] = await this.cacheManager.store.keys<string[]>(key);
    const result: IGraphConfig[] = await Promise.all(
      keys.map(async (key: string, index: number, arr: string[]) => {
        const value: string = await this.cacheManager.get(key);
        const point: IGraphConfig = { x: key, y: value, etc: '' };
        console.log(point);
        return point;
      }),
    );
    return result;
  }

  async getValueCache(key: string): Promise<string> {
    const result: string = await this.cacheManager.get<string>(key);
    return result;
  }
}
