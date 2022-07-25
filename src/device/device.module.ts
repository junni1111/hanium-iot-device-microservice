import { CacheModule, Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DevicePollingService } from './device-polling.service';
import { DeviceTemperatureModule } from './thermometer/device-temperature.module';
import { MqttBrokerModule } from './mqtt-broker.module';
import { DeviceWaterPumpModule } from './water-pump/device-water-pump.module';
import { DeviceLedModule } from './led/device-led.module';
import { DeviceMasterModule } from './master/device-master.module';
import { DeviceSlaveModule } from './slave/device-slave.module';
import { CacheConfigModule } from 'src/config/cache/cache.module';
import { CacheConfigService } from 'src/config/cache/cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [CacheConfigModule],
      useClass: CacheConfigService,
      inject: [CacheConfigService],
    }),
    MqttBrokerModule,
    DeviceMasterModule,
    DeviceSlaveModule,
    DeviceLedModule,
    DeviceTemperatureModule,
    DeviceWaterPumpModule,
  ],
  controllers: [DeviceController],
  providers: [DevicePollingService],
  exports: [
    DeviceMasterModule,
    DeviceSlaveModule,
    DeviceLedModule,
    DeviceTemperatureModule,
    DeviceWaterPumpModule,
    DevicePollingService,
  ],
})
export class DeviceModule {}
