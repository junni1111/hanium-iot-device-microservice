// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const device_host = process.env.DEVICE_HOST || '0.0.0.0';
export const device_port = Number(process.env.DEVICE_HOST) || 7779;
export const mqtt_broker_url =
  process.env.MQTT_BROKER_URL || 'mqtt://mosquitto:1883';
