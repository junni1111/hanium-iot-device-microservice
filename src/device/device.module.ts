import { CacheModule, Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MQTT_BROKER } from '../util/constants/constants';
import { MQTT_BROKER_URL } from '../config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Temperature } from './entities/temperature.entity';
import { DevicePollingService } from './device-polling.service';
import { DeviceMasterService } from './master/device-master.service';
import { Humidity } from './entities/humidity.entity';
import { WaterPump } from './entities/water-pump.entity';
import { Led } from './entities/led.entity';
// import { TemperatureRepository } from './repositories/temperature.repository';
import { Master } from './entities/master.entity';
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
import { TemperatureLog } from './entities/temperature-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Temperature,
      Humidity,
      WaterPump,
      Led,
      Slave,
      MasterRepository,
      SlaveRepository,
      TemperatureLog,
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
