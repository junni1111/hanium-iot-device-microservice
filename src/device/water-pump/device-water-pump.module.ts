import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSlaveModule } from '../slave/device-slave.module';
import { MqttBrokerModule } from '../mqtt-broker.module';
import { WaterPumpRepository } from '../repositories/water-pump.repository';
import { WaterPumpConfig } from './entities/water-pump.entity';
import { DeviceWaterPumpService } from './device-water-pump.service';
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
    TypeOrmModule.forFeature([WaterPumpConfig, WaterPumpRepository]),
  ],
  providers: [DeviceWaterPumpService],
  exports: [TypeOrmModule, DeviceWaterPumpService],
})
export class DeviceWaterPumpModule {}
