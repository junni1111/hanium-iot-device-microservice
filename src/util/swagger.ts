import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import {
  LED,
  MASTER,
  SLAVE,
  THERMOMETER,
  WATER_PUMP,
} from './constants/swagger';

const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
};

export const setupSwagger = (app: INestApplication): void => {
  const options = new DocumentBuilder()
    .setTitle('IoT Device MicroService')
    .setDescription('IoT Device MicroService 문서입니다')
    .setVersion('1.0.0')
    .addTag(MASTER)
    .addTag(SLAVE)
    .addTag(THERMOMETER)
    .addTag(WATER_PUMP)
    .addTag(LED)
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('ms-spec', app, document, swaggerCustomOptions);
};
