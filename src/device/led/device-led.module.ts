import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSlaveModule } from '../slave/device-slave.module';
import { RedisModule } from '../../cache/redis.module';
import { MqttBrokerModule } from '../mqtt-broker.module';
import { DeviceLedService } from './device-led.service';
import { LedRepository } from '../repositories/led.repository';
import { LedConfig } from '../entities/led.entity';

@Module({
  imports: [
    DeviceSlaveModule,
    RedisModule,
    MqttBrokerModule,
    TypeOrmModule.forFeature([LedRepository, LedConfig]),
  ],
  providers: [DeviceLedService],
  exports: [TypeOrmModule, DeviceLedService],
})
export class DeviceLedModule {}
