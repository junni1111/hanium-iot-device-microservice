import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_USER,
  POSTGRES,
} from '../../util/constants/database';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DataBaseConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: POSTGRES,
      host: this.configService.get<string>(DATABASE_HOST),
      database: this.configService.get<string>(DATABASE_NAME),
      username: this.configService.get<string>(DATABASE_USER),
      password: this.configService.get<string>(DATABASE_PASSWORD),
      port: +this.configService.get<number>(DATABASE_PORT),

      entities: [path.join(__dirname, '../../**/*.entity.{ts,js}')],
      synchronize: true,
    };
  }
}
