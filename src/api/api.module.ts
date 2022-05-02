import { Module } from '@nestjs/common';
import { DeviceModule } from '../device/device.module';
import { ApiSlaveController } from './api-slave.controller';
import { ApiMasterController } from './api-master.controller';
import { ApiUtilityController } from './api-utility.controller';

@Module({
  imports: [DeviceModule],
  controllers: [ApiMasterController, ApiSlaveController, ApiUtilityController],
})
export class ApiModule {}
