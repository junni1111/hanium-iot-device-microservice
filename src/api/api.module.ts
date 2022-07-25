import { CacheModule, Module } from '@nestjs/common';
import { DeviceModule } from '../device/device.module';
import { ApiSlaveController } from './slave/api-slave.controller';
import { ApiMasterController } from './master/api-master.controller';
import { ApiUtilityController } from './api-utility.controller';
import * as redisStore from 'cache-manager-ioredis';
import { ApiLedService } from './led/api-led.service';
import { ApiWaterPumpService } from './water-pump/api-water-pump.service';
import { ApiSlaveService } from './slave/api-slave.service';
import { ApiWaterPumpController } from './water-pump/api-water-pump.controller';
import { ApiLedController } from './led/api-led.controller';
import { ApiThermometerController } from './thermometer/api-thermometer.controller';
import { ApiFanController } from './fan/api-fan.controller';
import { DeviceMasterService } from '../device/master/device-master.service';
import { DeviceSlaveService } from '../device/slave/device-slave.service';
import { CacheConfigModule } from '../config/cache/cache.module';
import { CacheConfigService } from '../config/cache/cache.service';

@Module({
  imports: [
    DeviceModule,
    CacheModule.registerAsync({
      imports: [CacheConfigModule],
      useClass: CacheConfigService,
      inject: [CacheConfigService],
    }),
  ],
  controllers: [
    ApiMasterController,
    ApiSlaveController,
    ApiWaterPumpController,
    ApiLedController,
    ApiThermometerController,
    ApiFanController,
    ApiUtilityController,
  ],
  providers: [
    ApiLedService,
    ApiWaterPumpService,
    ApiSlaveService,
    DeviceMasterService,
    DeviceSlaveService,
  ],
})
export class ApiModule {}
