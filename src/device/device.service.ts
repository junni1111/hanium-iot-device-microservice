import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class DeviceService {
  constructor(@Inject(MQTT_BROKER) private readonly mqttBroker: ClientProxy) {}

  getMasterId(topic: string) {
    return parseInt(topic.substring(7, 8));
  }

  publishEvent(topic: string, message: string) {
    try {
      console.log(message);
      this.mqttBroker.emit(topic, message);
      return { status: HttpStatus.OK, message, topic };
    } catch (e) {
      throw e;
    }
  }
}
