import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSlaveModule } from '../slave/device-slave.module';
import { ThermometerConfig } from '../entities/thermometer.entity';
import { Temperature } from '../entities/temperature.entity';
import { ThermometerRepository } from '../repositories/thermometer.repository';
import { TemperatureRepository } from './device-temperature.repository';
import { DeviceTemperatureController } from './device-temperature.controller';
import { DeviceTemperatureService } from './device-temperature.service';
import { DeviceThermometerService } from './device-thermometer.service';
import { MqttBrokerModule } from '../mqtt-broker.module';
import { DeviceFanService } from '../fan/device-fan.service';
import { CacheConfigModule } from '../../config/cache/cache.module';
import { CacheConfigService } from '../../config/cache/cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [CacheConfigModule],
      useClass: CacheConfigService,
      inject: [CacheConfigService],
    }),
    DeviceSlaveModule,
    MqttBrokerModule,
    TypeOrmModule.forFeature([
      ThermometerConfig,
      Temperature,
      ThermometerRepository,
      TemperatureRepository,
    ]),
  ],
  controllers: [DeviceTemperatureController],
  providers: [
    DeviceThermometerService,
    DeviceTemperatureService,
    DeviceFanService,
  ],
  exports: [
    TypeOrmModule,
    DeviceTemperatureService,
    DeviceThermometerService,
    DeviceFanService,
  ],
})
export class DeviceTemperatureModule {}
