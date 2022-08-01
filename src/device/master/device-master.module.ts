import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Master } from './entities/master.entity';
import { MasterRepository } from '../repositories/master.repository';
import { DeviceMasterService } from './device-master.service';

@Module({
  imports: [TypeOrmModule.forFeature([Master, MasterRepository])],
  providers: [DeviceMasterService],
  exports: [TypeOrmModule, DeviceMasterService],
})
export class DeviceMasterModule {}
