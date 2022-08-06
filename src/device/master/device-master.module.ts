import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
<<<<<<< HEAD
import { MasterRepository } from './master.repository';
=======
import { MasterRepository } from '../repositories/master.repository';
>>>>>>> 87cc732c0a39fb2bf28c9b7c68c001b9fcdd02e7
import { DeviceMasterService } from './device-master.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterRepository])],
  providers: [DeviceMasterService],
  exports: [TypeOrmModule, DeviceMasterService],
})
export class DeviceMasterModule {}
