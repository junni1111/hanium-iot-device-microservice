import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSlaveModule } from '../slave/device-slave.module';
import { ThermometerConfig } from '../entities/thermometer.entity';
import { Temperature } from '../entities/temperature-log.entity';
import { ThermometerRepository } from '../repositories/thermometer.repository';
import { TemperatureRepository } from './device-temperature.repository';
import { DeviceTemperatureController } from './device-temperature.controller';
import { DeviceTemperatureService } from './device-temperature.service';
import { DeviceThermometerService } from './device-thermometer.service';
import { RedisModule } from '../../cache/redis.module';
import { MqttBrokerModule } from '../mqtt-broker.module';

@Module({
  imports: [
    DeviceSlaveModule,
    RedisModule,
    MqttBrokerModule,
    TypeOrmModule.forFeature([
      ThermometerConfig,
      Temperature,
      ThermometerRepository,
      TemperatureRepository,
    ]),
  ],
  controllers: [DeviceTemperatureController],
  providers: [DeviceThermometerService, DeviceTemperatureService],
  exports: [TypeOrmModule, DeviceThermometerService],
})
export class DeviceTemperatureModule {}
