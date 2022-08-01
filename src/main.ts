import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './util/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);
  const DEVICE_HOST = configService.get<string>('DEVICE_HOST');
  const DEVICE_PORT = configService.get<number>('DEVICE_PORT_8000_TCP_PORT');
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
    transport: Transport.MQTT,
    options: {
      url: MQTT_BROKER_URL,
    },
  });

  setupSwagger(app);

  await app.startAllMicroservices();
  await app.listen(DEVICE_PORT, () => {
    Logger.log(
      `Running Device Microservice. 
      Listening HOST:${DEVICE_HOST} PORT:${DEVICE_PORT} MQTT URL:${MQTT_BROKER_URL}...
      Redis Host: ${REDIS_HOST} Redis Port: ${REDIS_PORT}`,
    );
  });
}

bootstrap();
