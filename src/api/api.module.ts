import { CacheModule, Module } from '@nestjs/common';
import { DeviceModule } from '../device/device.module';
import { ApiSlaveController } from './api-slave.controller';
import { ApiMasterController } from './api-master.controller';
import { ApiUtilityController } from './api-utility.controller';
import * as redisStore from 'cache-manager-ioredis';
import { REDIS_HOST, REDIS_PORT } from '../config/redis.config';

@Module({
  imports: [
    DeviceModule,
    CacheModule.register({
      store: redisStore,
      host: REDIS_HOST,
      port: REDIS_PORT,
    }),
  ],
  controllers: [ApiMasterController, ApiSlaveController, ApiUtilityController],
})
export class ApiModule {}
