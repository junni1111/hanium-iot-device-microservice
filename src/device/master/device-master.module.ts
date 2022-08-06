import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceMasterService } from './device-master.service';
import { MasterRepository } from './master.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MasterRepository])],
  providers: [DeviceMasterService],
  exports: [TypeOrmModule, DeviceMasterService],
})
export class DeviceMasterModule {}
