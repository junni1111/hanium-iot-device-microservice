import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DevicePollingService } from './device-polling.service';
import { RedisModule } from '../cache/redis.module';
import { DeviceTemperatureModule } from './thermometer/device-temperature.module';
import { MqttBrokerModule } from './mqtt-broker.module';
import { DeviceWaterPumpModule } from './water-pump/device-water-pump.module';
import { DeviceLedModule } from './led/device-led.module';

@Module({
  imports: [
    RedisModule,
    MqttBrokerModule,
    DeviceLedModule,
    DeviceTemperatureModule,
    DeviceWaterPumpModule,
  ],
  controllers: [DeviceController],
  providers: [DevicePollingService],
  exports: [DevicePollingService],
})
export class DeviceModule {}
