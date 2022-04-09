import { Module } from '@nestjs/common';
import { DeviceModule } from '../device/device.module';
import { ApiSlaveController } from './api-slave.controller';
import { ApiMasterController } from './api-master.controller';

@Module({
  imports: [DeviceModule],
  controllers: [ApiMasterController, ApiSlaveController],
})
export class ApiModule {}
