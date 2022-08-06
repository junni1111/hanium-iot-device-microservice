import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { MqttContext } from '@nestjs/microservices';
import { Interval } from '@nestjs/schedule';
import { EPollingState, IGatewayStatus } from './interfaces/polling-status';
import { Cache } from 'cache-manager';
import { POLLING } from '../util/constants/mqtt-topic';

@Injectable()
export class DevicePollingService {
  private gateways: IGatewayStatus[] = [];
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getPollingState(masterId: string) {
    /**
     * Todo: Make Polling Packet
     *       & Extract Method */
    const makeKey = (masterId: string) => POLLING.replace('+', `${masterId}`);

    const pollingState = await this.cacheManager.get<number>(makeKey(masterId));
    // console.log(`cached polling state: `, pollingState);
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
