import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { DEVICE_HOST, DEVICE_PORT, MQTT_BROKER_URL } from './config/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { REDIS_HOST, REDIS_PORT } from './config/redis.config';

async function bootstrap() {
  console.log(`Start ENV = `, process.env.NODE_ENV);
  console.log(
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

  const microserviceTcp = app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: DEVICE_HOST,
      port: DEVICE_PORT,
    },
  });

  const microserviceMqtt = app.connectMicroservice({
    transport: Transport.MQTT,
    options: {
      url: MQTT_BROKER_URL,
    },
  });

  await app.startAllMicroservices();
  await app.listen(8888, () => {
    console.log(
      `Running Device Microservice. Listening HOST:${DEVICE_HOST} PORT:${DEVICE_PORT} MQTT URL:${MQTT_BROKER_URL}...
      Redis Host: ${REDIS_HOST} Redis Port: ${REDIS_PORT}`,
    );
  });
}

bootstrap();
