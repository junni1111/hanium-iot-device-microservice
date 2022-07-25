import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSlaveModule } from '../slave/device-slave.module';
import { MqttBrokerModule } from '../mqtt-broker.module';
import { DeviceLedService } from './device-led.service';
import { LedRepository } from '../repositories/led.repository';
import { LedConfig } from '../entities/led.entity';
import { CacheConfigModule } from '../../config/cache/cache.module';
import { CacheConfigService } from '../../config/cache/cache.service';

@Module({
  imports: [
    DeviceSlaveModule,
    CacheModule.registerAsync({
      imports: [CacheConfigModule],
      useClass: CacheConfigService,
      inject: [CacheConfigService],
    }),
    MqttBrokerModule,
    TypeOrmModule.forFeature([LedRepository, LedConfig]),
  ],
  providers: [DeviceLedService],
  exports: [TypeOrmModule, DeviceLedService],
})
export class DeviceLedModule {}
