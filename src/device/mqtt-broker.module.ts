import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { MQTT_BROKER } from '../util/constants/constants';
import { MqttBrokerService } from './mqtt-broker.service';
import { ClientsMQTTConfigService } from 'src/config/clients/clients.mqtt.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MQTT_BROKER,
        imports: [ClientsModule],
        useClass: ClientsMQTTConfigService,
        inject: [ClientsMQTTConfigService],
      },
    ]),
  ],
  providers: [MqttBrokerService],
  exports: [ClientsModule, MqttBrokerService],
})
export class MqttBrokerModule {}
