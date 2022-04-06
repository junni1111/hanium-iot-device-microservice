import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { DeviceModule } from '../device/device.module';

@Module({
  imports: [DeviceModule],
  controllers: [ApiController],
})
export class ApiModule {}
