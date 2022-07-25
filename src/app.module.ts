import { Module } from '@nestjs/common';
import { DeviceModule } from './device/device.module';
import { ApiModule } from './api/api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { DataBaseConfigModule } from './config/database/database.module';
import { DataBaseConfigService } from './config/database/database.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${__dirname}/../env/.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [DataBaseConfigModule],
      useClass: DataBaseConfigService,
      inject: [DataBaseConfigService],
    }),
    DeviceModule,
    ApiModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
