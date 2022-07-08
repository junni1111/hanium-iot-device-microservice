import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceMasterModule } from '../master/device-master.module';
import { SlaveRepository } from '../repositories/slave.repository';
import { DeviceSlaveService } from './device-slave.service';
import { Slave } from '../entities/slave.entity';

@Module({
  imports: [
    DeviceMasterModule,
    TypeOrmModule.forFeature([Slave, SlaveRepository]),
  ],
  providers: [DeviceSlaveService],
  exports: [TypeOrmModule],
})
export class DeviceSlaveModule {}
