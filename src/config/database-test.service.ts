import { TypeOrmModule } from '@nestjs/typeorm';
import { POSTGRES } from '../util/constants/database';
import * as path from 'path';

export function getTypeOrmTestModule() {
  return TypeOrmModule.forRoot({
    type: POSTGRES,
    host: 'localhost',
    database: 'test',
    username: 'postgres',
    password: '789456',
    port: 5433,
    entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
    synchronize: true,
  });
}
