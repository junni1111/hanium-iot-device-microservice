import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MQTT_BROKER } from '../util/constants/constants';
import { MQTT_BROKER_URL } from '../config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Temperature } from './entities/temperature.entity';
import { DevicePollingService } from './device-polling.service';
import { DeviceMasterService } from './device-master.service';
import { Humidity } from './entities/humidity.entity';
import { WaterPump } from './entities/water-pump.entity';
import { Led } from './entities/led.entity';
import { TemperatureRepository } from './repositories/temperature.repository';
import { Master } from './entities/master.entity';
import { Slave } from './entities/slave.entity';
import { MasterRepository } from './repositories/master.repository';
import { SlaveRepository } from './repositories/slave.repository';
import { DeviceTemperatureService } from './device-temperature.service';
import { DeviceWaterPumpService } from './device-water-pump.service';
import { DeviceLedService } from './device-led.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Temperature,
      Humidity,
      WaterPump,
      Led,
      Master,
      Slave,
      TemperatureRepository,
      MasterRepository,
      SlaveRepository,
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
  ],
  controllers: [DeviceController],
  providers: [
    DevicePollingService,
    DeviceMasterService,
    DeviceService,
    DeviceTemperatureService,
    DeviceLedService,
    DeviceWaterPumpService,
  ],
  exports: [
    DevicePollingService,
    DeviceMasterService,
    DeviceService,
    DeviceTemperatureService,
    DeviceLedService,
    DeviceWaterPumpService,
  ],
})
export class DeviceModule {}
