import { CacheModule, Module } from '@nestjs/common';
import { DeviceModule } from '../device/device.module';
import { ApiSlaveController } from './api-slave.controller';
import { ApiMasterController } from './api-master.controller';
import { ApiUtilityController } from './api-utility.controller';
import * as redisStore from 'cache-manager-ioredis';
import { REDIS_HOST, REDIS_PORT } from '../config/redis.config';
import { ApiLedService } from './api-led.service';
import { ApiWaterPumpService } from './api-water-pump.service';

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
  providers: [ApiLedService, ApiWaterPumpService],
})
export class ApiModule {}
