import { Module } from '@nestjs/common';
import { DeviceModule } from './device/device.module';
import { ApiModule } from './api/api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseService } from './config/database.service';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from './cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseService.getTypeOrmConfig()),
    DeviceModule,
    ApiModule,
    RedisModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
