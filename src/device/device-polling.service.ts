import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../util/constants/constants';
import { ClientProxy, MqttContext } from '@nestjs/microservices';
import { Interval } from '@nestjs/schedule';
import { EPollingState, IGatewayStatus } from './interfaces/polling-status';
import { Cache } from 'cache-manager';
import { POLLING } from '../util/constants/mqtt-topic';

@Injectable()
export class DevicePollingService {
  private gateways: IGatewayStatus[] = [];
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(MQTT_BROKER) private readonly mqttBroker: ClientProxy,
  ) {}

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

  /* TODO: Change to better way */
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

  async getPollingState(masterId: string) {
    /**
     * Todo: Make Polling Packet
     *       & Extract Method */
    const makeKey = (masterId: string) => POLLING.replace('+', `${masterId}`);

    const pollingState = await this.cacheManager.get<number>(makeKey(masterId));
    console.log(`cached polling state: `, pollingState);
    return pollingState;
  }

  mockPollingExceptionTrigger(
    mockContext: MqttContext,
    mockPayload: EPollingState,
  ) {
    console.log(`추후 작동할 mock 트리거`);
    console.log(`Topic: `, mockContext.getTopic());
    console.log(`Payload: `, mockPayload);
  }
}
