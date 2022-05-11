import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-ioredis';
import { RedisController } from './redis.controller';
import { REDIS_HOST, REDIS_PORT } from '../config/redis.config';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: REDIS_HOST,
      port: REDIS_PORT,
    }),
  ],
  controllers: [RedisController],
  // providers: [CacheModuleService],
})
export class RedisModule {}
