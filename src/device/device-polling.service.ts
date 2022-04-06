import { Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { Interval } from '@nestjs/schedule';
import { EPollingState, IGatewayStatus } from './interfaces/polling-status';

@Injectable()
export class DevicePollingService {
  private gateways: IGatewayStatus[] = [];
  constructor(@Inject(MQTT_BROKER) private readonly mqttBroker: ClientProxy) {}

  /* TODO: Gateway Network Check */
  @Interval('gateway-polling-check', 1000)
  private checkPollingStatus() {
    this.gateways.map((gateway) => {
      if (gateway.pollingCount > 6) {
        gateway.state = EPollingState.ERROR1;
        console.log(`Set Polling Error state`);
      }
    });
  }

  @Interval('gateway-polling', 10000)
  private increasePollingCount() {
    this.gateways.map((gateway) => gateway.pollingCount++);
  }

  setPollingStatus(gatewayId: number, state: EPollingState) {
    if (!this.gateways[gatewayId]) {
      this.gateways[gatewayId] = {
        state: EPollingState.OK,
        pollingCount: 0,
      };
    }
    this.gateways[gatewayId].state = state;
    this.gateways[gatewayId].pollingCount = 0;
  }

  getPollingState(gatewayId: number) {
    if (!this.gateways[gatewayId]) {
      return EPollingState.ERROR1;
    }

    return this.gateways[gatewayId].state;
  }
}
