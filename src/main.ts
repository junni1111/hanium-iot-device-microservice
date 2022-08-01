import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);
  const DEVICE_HOST = configService.get<string>('DEVICE_HOST', '0.0.0.0');
  const DEVICE_PORT = configService.get<number>(
    'DEVICE_PORT_8888_TCP_PORT',
    8888,
  );
  const DEVICE_HEALTH_PORT = configService.get<number>(
    'DEVICE_PORT_8000_TCP_PORT',
    8000,
  );
  const MQTT_BROKER_URL = configService.get<string>('MQTT_BROKER_URL');
  const REDIS_HOST = configService.get<string>('REDIS_HOST');
  const REDIS_PORT = configService.get<number>('REDIS_PORT');

  Logger.log(`Start ENV = ${process.env.NODE_ENV}`);
  console.log(`ENV LIST:`, process.env);
  Logger.log(
    `Device Microservice Listening HOST:${DEVICE_HOST} PORT:${DEVICE_PORT} MQTT URL:${MQTT_BROKER_URL}...
      Redis Host: ${REDIS_HOST} Redis Port: ${REDIS_PORT}`,
  );
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
