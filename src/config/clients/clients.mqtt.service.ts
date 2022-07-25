import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProvider,
  ClientsModuleOptionsFactory,
} from '@nestjs/microservices/module/interfaces/clients-module.interface';
import { Transport } from '@nestjs/microservices';

@Injectable()
export class ClientsMQTTConfigService implements ClientsModuleOptionsFactory {
  constructor(private configService: ConfigService) {}

  createClientOptions(): ClientProvider {
    return {
      transport: Transport.MQTT,
      options: {
        url: this.configService.get<string>('MQTT_BROKER_URL'),
      },
    };
  }
}
