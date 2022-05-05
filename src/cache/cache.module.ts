import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-ioredis';
import { CacheController } from './cache.controller';
import { REDIS_HOST, REDIS_PORT } from '../config/redis.config';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: REDIS_HOST,
      port: REDIS_PORT,
    }),
  ],
  controllers: [CacheController],
  // providers: [CacheModuleService],
})
export class CacheModuleModule {}
