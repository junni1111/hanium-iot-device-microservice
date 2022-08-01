import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceMasterModule } from '../master/device-master.module';
import { SlaveRepository } from '../repositories/slave.repository';
import { DeviceSlaveService } from './device-slave.service';
import { Slave } from '../entities/slave.entity';
import { LedRepository } from '../repositories/led.repository';
import { WaterPumpRepository } from '../repositories/water-pump.repository';
import { ThermometerRepository } from '../repositories/thermometer.repository';

@Module({
  imports: [
    DeviceMasterModule,
    TypeOrmModule.forFeature([
      Slave,
      SlaveRepository,
      LedRepository,
      WaterPumpRepository,
      ThermometerRepository,
    ]),
  ],
  providers: [DeviceSlaveService],
  exports: [TypeOrmModule],
})
export class DeviceSlaveModule {}