import { CacheModule, Module } from '@nestjs/common';
import { DeviceModule } from '../device/device.module';
import { ApiSlaveController } from './slave/api-slave.controller';
import { ApiMasterController } from './master/api-master.controller';
import { ApiUtilityController } from './api-utility.controller';
import * as redisStore from 'cache-manager-ioredis';
import { REDIS_HOST, REDIS_PORT } from '../config/redis.config';
import { ApiLedService } from './led/api-led.service';
import { ApiWaterPumpService } from './water-pump/api-water-pump.service';
import { ApiSlaveService } from './slave/api-slave.service';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: REDIS_HOST,
      port: REDIS_PORT,
    }),
    DeviceModule,
  ],
  controllers: [ApiMasterController, ApiSlaveController, ApiUtilityController],
  providers: [ApiLedService, ApiWaterPumpService, ApiSlaveService],
})
export class ApiModule {}
