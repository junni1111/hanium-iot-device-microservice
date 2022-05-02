import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  DATABASE_MICROSERVICES_HOST,
  DATABASE_MICROSERVICES_PORT,
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_USER,
  DEV,
  MODE,
  POSTGRES,
} from '../util/constants/database';
import { join } from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

class DatabaseService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    console.log(`Get Database Key, value: `, key, value);
    if (!value && throwOnMissing) {
      throw new Error(`Config Error - Missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getDatabaseMicroservicesHost() {
    return this.getValue(DATABASE_MICROSERVICES_HOST, true);
  }

  public getDatabaseMicroservicesPort() {
    return this.getValue(DATABASE_MICROSERVICES_PORT, true);
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

      entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
      migrationsTableName: 'migration',
      migrations: ['src/migration/*.ts'],

      cli: {
        migrationsDir: 'src/migration',
      },

      ssl: this.isProduction(),
      synchronize: true,
    };
  }
}

const databaseService = new DatabaseService(process.env).ensureValues([
  DATABASE_MICROSERVICES_HOST,
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_PORT,
]);

export { databaseService };
