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
import { ApiWaterPumpController } from './water-pump/api-water-pump.controller';
import { ApiLedController } from './led/api-led.controller';
import { ApiThermometerController } from './thermometer/api-thermometer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Temperature } from '../device/entities/temperature.entity';
import { Humidity } from '../device/entities/humidity.entity';
import { WaterPump } from '../device/entities/water-pump.entity';
import { Led } from '../device/entities/led.entity';
import { Master } from '../device/entities/master.entity';
import { Slave } from '../device/entities/slave.entity';
import { TemperatureRepository } from '../device/repositories/temperature.repository';
import { MasterRepository } from '../device/repositories/master.repository';
import { SlaveRepository } from '../device/repositories/slave.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Temperature,
      Humidity,
      WaterPump,
      Led,
      Master,
      Slave,
      TemperatureRepository,
      MasterRepository,
      SlaveRepository,
    ]),
    CacheModule.register({
      store: redisStore,
      host: REDIS_HOST,
      port: REDIS_PORT,
    }),
    DeviceModule,
  ],
  controllers: [
    ApiMasterController,
    ApiSlaveController,
    ApiWaterPumpController,
    ApiLedController,
    ApiThermometerController,
    ApiUtilityController,
  ],
  providers: [ApiLedService, ApiWaterPumpService, ApiSlaveService],
})
export class ApiModule {}
