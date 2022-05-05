// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const REDIS_HOST = process.env.REDIS_HOST || '0.0.0.0';
export const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
