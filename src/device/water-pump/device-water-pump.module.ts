import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSlaveModule } from '../slave/device-slave.module';
import { RedisModule } from '../../cache/redis.module';
import { MqttBrokerModule } from '../mqtt-broker.module';
import { WaterPumpRepository } from '../repositories/water-pump.repository';
import { WaterPumpConfig } from '../entities/water-pump.entity';
import { DeviceWaterPumpService } from './device-water-pump.service';

@Module({
  imports: [
    DeviceSlaveModule,
    RedisModule,
    MqttBrokerModule,
    TypeOrmModule.forFeature([WaterPumpConfig, WaterPumpRepository]),
  ],
  providers: [DeviceWaterPumpService],
  exports: [TypeOrmModule, DeviceWaterPumpService],
})
export class DeviceWaterPumpModule {}
