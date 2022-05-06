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
    const cachedValue = await this.cacheManager.get<string>(key);
    if (cachedValue) {
      console.log(`cache hit!`, cachedValue);
      return res.send(`save time: ${cachedValue}`);
    }

    const now = new Date().toDateString();
    await this.cacheManager.set<string>(key, now);

    return res.send(`save time: ${now}`);
  }

  async setTestCache(key: string, value: number) {
    await this.cacheManager.set<number>(key, value);
  }

  async getTestCache(key: string) {
    return this.cacheManager.get<number>(key);
  }
}
