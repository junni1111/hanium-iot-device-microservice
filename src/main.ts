import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import {
  DEVICE_HEALTH_PORT,
  DEVICE_HOST,
  DEVICE_PORT,
  MQTT_BROKER_URL,
} from './config/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { REDIS_HOST, REDIS_PORT } from './config/redis.config';

async function bootstrap() {
  Logger.log(`Start ENV = ${process.env.NODE_ENV}`);
  console.log(`ENV LIST:`, process.env);
  Logger.log(
    `Device Microservice Listening HOST:${DEVICE_HOST} PORT:${DEVICE_PORT} MQTT URL:${MQTT_BROKER_URL}...
      Redis Host: ${REDIS_HOST} Redis Port: ${REDIS_PORT}`,
  );
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: DEVICE_HOST,
      port: DEVICE_PORT,
    },
  });

  app.connectMicroservice({
    transport: Transport.MQTT,
    options: {
      url: MQTT_BROKER_URL,
    },
  });

  await app.startAllMicroservices();
  await app.listen(DEVICE_HEALTH_PORT, () => {
    Logger.log(
      `Running Device Microservice. 
      Listening HOST:${DEVICE_HOST} HEALTH_PORT:${DEVICE_HEALTH_PORT} DEVICE_PORT:${DEVICE_PORT} MQTT URL:${MQTT_BROKER_URL}...
      Redis Host: ${REDIS_HOST} Redis Port: ${REDIS_PORT}`,
    );
  });
}

bootstrap();
