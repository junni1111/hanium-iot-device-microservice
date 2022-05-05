import { CacheModule, Module } from '@nestjs/common';
import { DeviceModule } from './device/device.module';
import { ApiModule } from './api/api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseService } from './config/database.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModuleModule } from './cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseService.getTypeOrmConfig()),
    DeviceModule,
    ApiModule,
    CacheModuleModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
