// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const DEVICE_HOST = process.env.DEVICE_HOST || '0.0.0.0';
export const DEVICE_PORT = Number(process.env.DEVICE_HOST) || 7779;
export const MQTT_BROKER_URL =
  process.env.MQTT_BROKER_URL || 'mqtt://mosquitto:1883';
