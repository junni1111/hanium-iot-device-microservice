import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { device_host, device_port, mqtt_broker_url } from './config/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
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
      host: device_host,
      port: device_port,
    },
  });
  const microserviceMqtt = app.connectMicroservice({
    transport: Transport.MQTT,
    options: {
      url: mqtt_broker_url,
    },
  });

  await app.startAllMicroservices();
  await app.listen(8888, () => {
    console.log(
      `Device Microservice Listening HOST:${device_host} PORT:${device_port} MQTT URL:${mqtt_broker_url}...`,
    );
  });
}

bootstrap();
