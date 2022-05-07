import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.join(
    __dirname,
    process.env.NODE_ENV === 'production'
      ? '../../env/.env.production'
      : process.env.NODE_ENV === 'test'
      ? '../../env/.env.test'
      : process.env.NODE_ENV === 'development'
      ? '../../env/.env.development'
      : '../../env/.env',
  ),
});

export const DEVICE_HOST = process.env.DEVICE_HOST || '0.0.0.0';
export const DEVICE_PORT = Number(process.env.DEVICE_PORT) || 7779;
export const MQTT_BROKER_URL =
  process.env.MQTT_BROKER_URL || 'mqtt://0.0.0.0:1883';
