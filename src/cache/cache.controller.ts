import {
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Param,
  Res,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Response } from 'express';

@Controller('cache')
export class CacheController {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  @Get('test/:key')
  async getCache(@Res() res: Response, @Param('key') key: string) {
    console.log(`call cache key: `, key);
    const value = await this.cacheManager.get(key);
    if (value) {
      console.log(`value hit!`, value);
    }

    const setValue = await this.cacheManager.set(key, 'val-' + key);
    const TIME_KEY = 'time';
    const saveTime = await this.cacheManager.get<number>(TIME_KEY);

    if (saveTime) {
      console.log(`cache hit!`);
      return res.send(`save time: ${saveTime}`);
    }
    const now = new Date().getTime();
    await this.cacheManager.set<number>(TIME_KEY, now, { ttl: 1000 });
    return res.send(`save time: ${saveTime}`);
  }
}
