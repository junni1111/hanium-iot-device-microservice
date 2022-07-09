import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MQTT_BROKER } from '../util/constants/constants';
import { MQTT_BROKER_URL } from '../config/config';
import { MqttBrokerService } from './mqtt-broker.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MQTT_BROKER,
        transport: Transport.MQTT,
        options: {
          url: MQTT_BROKER_URL,
        },
      },
    ]),
  ],
  providers: [MqttBrokerService],
  exports: [ClientsModule, MqttBrokerService],
})
export class MqttBrokerModule {}
