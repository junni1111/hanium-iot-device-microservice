import { Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MqttBrokerService {
  constructor(@Inject(MQTT_BROKER) private broker: ClientProxy) {}

  publish(topic: string, message: string) {
    return this.broker.emit(topic, message);
  }
}
