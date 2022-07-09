import { CacheModule, Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MQTT_BROKER } from '../util/constants/constants';
import { MQTT_BROKER_URL } from '../config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThermometerConfig } from './entities/thermometer.entity';
import { DevicePollingService } from './device-polling.service';
import { DeviceMasterService } from './master/device-master.service';
import { Humidity } from './entities/humidity.entity';
import { WaterPump, WaterPumpConfig } from './entities/water-pump.entity';
import { Led } from './entities/led.entity';
import { Slave } from './entities/slave.entity';
import { MasterRepository } from './repositories/master.repository';
import { SlaveRepository } from './repositories/slave.repository';
import { DeviceTemperatureService } from './thermometer/device-temperature.service';
import { DeviceWaterPumpService } from './water-pump/device-water-pump.service';
import { DeviceLedService } from './led/device-led.service';
import * as redisStore from 'cache-manager-ioredis';
import { REDIS_HOST, REDIS_PORT } from '../config/redis.config';
import { DeviceFanService } from './fan/device-fan.service';
import { RedisModule } from '../cache/redis.module';
import { DeviceTemperatureController } from './thermometer/device-temperature.controller';
import { Temperature } from './entities/temperature-log.entity';
import { DeviceTemperatureModule } from './thermometer/device-temperature.module';
import { WaterPumpRepository } from './repositories/water-pump.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ThermometerConfig,
      Humidity,
      WaterPump,
      Led,
      Slave,
      MasterRepository,
      SlaveRepository,
      Temperature,
      WaterPumpConfig,
      WaterPumpRepository,
    ]),
    ClientsModule.register([
      {
        name: MQTT_BROKER,
        transport: Transport.MQTT,
        options: {
          url: MQTT_BROKER_URL,
        },
      },
    ]),
    CacheModule.register({
      store: redisStore,
      host: REDIS_HOST,
      port: REDIS_PORT,
    }),
    RedisModule,
    DeviceTemperatureModule,
  ],
  controllers: [DeviceController, DeviceTemperatureController],
  providers: [
    DevicePollingService,
    DeviceMasterService,
    DeviceService,
    DeviceTemperatureService,
    DeviceLedService,
    DeviceWaterPumpService,
    DeviceFanService,
  ],
  exports: [
    DevicePollingService,
    DeviceMasterService,
    DeviceService,
    DeviceTemperatureService,
    DeviceLedService,
    DeviceWaterPumpService,
    DeviceFanService,
  ],
})
export class DeviceModule {}
