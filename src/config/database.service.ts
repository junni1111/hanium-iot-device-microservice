import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_USER,
  DEV,
  MODE,
  POSTGRES,
} from '../util/constants/database';
import * as path from 'path';

class DatabaseService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`Config Error - Missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getDatabasePort() {
    return this.getValue(DATABASE_PORT, true);
  }

  public isProduction() {
    const mode = this.getValue(MODE, false);
    return mode != DEV;
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: POSTGRES,
      host: this.getValue(DATABASE_HOST),
      database: this.getValue(DATABASE_NAME),
      username: this.getValue(DATABASE_USER),
      password: this.getValue(DATABASE_PASSWORD),
      port: parseInt(this.getValue(DATABASE_PORT)),

      entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
      // migrationsTableName: 'migration',
      // migrations: ['src/migration/*.ts'],

      // cli: {
      //   migrationsDir: 'src/migration',
      // },

      /**
       * Todo: SSL key 추가 */
      // ssl: this.isProduction(),
      synchronize: true,
    };
  }
}

const databaseService = new DatabaseService(process.env).ensureValues([
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PORT,
  DATABASE_PASSWORD,
]);

export { databaseService };
