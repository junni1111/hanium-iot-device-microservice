// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(
    process.env.NODE_ENV === 'production'
      ? '.production.env'
      : process.env.NODE_ENV === 'test'
      ? '.test.env'
      : '.development.env',
  ),
});

export const REDIS_HOST = process.env.REDIS_HOST || '0.0.0.0';
export const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
