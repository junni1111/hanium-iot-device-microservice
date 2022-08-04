import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterRepository } from './master.repository';
import { DeviceMasterService } from './device-master.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterRepository])],
  providers: [DeviceMasterService],
  exports: [TypeOrmModule, DeviceMasterService],
})
export class DeviceMasterModule {}
