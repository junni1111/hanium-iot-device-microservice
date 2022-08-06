import { CACHE_MANAGER, Controller, Inject } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MqttContext,
  Payload,
  Transport,
} from '@nestjs/microservices';
import {
  POLLING,
  SLAVE_RESPONSE,
  SLAVE_STATE,
} from '../util/constants/mqtt-topic';
import { EPollingState } from './interfaces/polling-status';
import { DevicePollingService } from './device-polling.service';
import { Cache } from 'cache-manager';
import { MasterPollingKey, SensorStateKey } from '../util/key-generator';

@Controller()
export class DeviceController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly pollingService: DevicePollingService,
  ) {}

  /**
   * Todo: Validate Polling Status Is Number */
  @EventPattern(POLLING, Transport.MQTT)
  async receivePollingResult(
    @Ctx() context: MqttContext,
    @Payload() pollingStatus: EPollingState,
  ) {
    const key = MasterPollingKey(context.getTopic());
    // console.log(`이전 상태 값: `, await this.cacheManager.get<number>(key));

    if (pollingStatus !== EPollingState.OK) {
      /**
       * Todo: Trigger Some Mock Method */
      console.log(`Polling 값 문제 발생`);
      console.log(`추후 여기서 트리거 발생`);
      this.pollingService.mockPollingExceptionTrigger(context, pollingStatus);
    }

    /** Cache Status To Redis */
    await this.cacheManager.set<number>(key, pollingStatus, { ttl: 60 });
  }

  @EventPattern(SLAVE_STATE, Transport.MQTT)
  async receiveSlaveState(
    @Payload() runtimeMinutes: number,
    @Ctx() context: MqttContext,
  ) {
    const [, mId, , sId, sensorName] = context.getTopic().split('/');
    const masterId = parseInt(mId);
    const slaveId = parseInt(sId);
    const sensor = `${sensorName}/state`; // 🤔
    /**
     * Todo: Extract Service & cleanup */
    /**
     * Todo: Cache Power State oxd1 */
    console.log(`slave info: `, masterId, slaveId, sensor);
    console.log(`salve runtime: `, runtimeMinutes);

    const key = SensorStateKey({
      sensor,
      masterId,
      slaveId,
    });
    if (runtimeMinutes > 0) {
      await this.cacheManager.set<string>(key, 'on', {
        ttl: runtimeMinutes * 60, // make minutes -> second
      });
    }
    console.log(`receive slave state packet: `, context.getPacket());
  }

  /**
   * Todo: Slave 펌웨어 수정 이후 제거 예정 */
  @EventPattern('master/+/assert', Transport.MQTT)
  async receiveAssert(@Payload() data: string, @Ctx() context: MqttContext) {
    console.log(`receive Assert packet: `, context.getPacket());

    console.log(`receive value `, data);
  }

  /**
   * Todo: Refactoring */
  @EventPattern(SLAVE_RESPONSE, Transport.MQTT)
  async receiveMemoryWriteResponse(
    @Payload() data: string,
    @Ctx() context: MqttContext,
  ) {
    /**
     * Todo: Get Sensor Name
     *       Cache Sensor State */
    const [, masterId, , slaveId, sensorName, , , responseStatus] = context
      .getTopic()
      .split('/');

    /** Todo: Extract Service */
    const runningStateKey = `master/${masterId}/slave/${slaveId}/${sensorName}/state`;
    const powerStateKey = `master/${masterId}/slave/${slaveId}/power/${sensorName}`;
    console.log(`res status: `, responseStatus);
    // const cacheRunningState = this.cacheManager.set<string>(
    //   runningStateKey,
    //   powerState,
    //   {
    //     ttl: runtime ? runtime * 60 : 0,
    //   },
    // );
    // const cachePowerState = this.cacheManager.set<string>(
    //   powerStateKey,
    //   powerState,
    //   { ttl: 0 },
    // );
    //
    // Promise.allSettled([cacheRunningState, cachePowerState]);

    console.log(
      `receive receiveMemoryWriteResponse packet: `,
      // context.getPacket(),
    );
    //
    // console.log(`receive value `, data);
  }

  /**
   * Todo: Slave 펌웨어 수정 이후 제거 예정 */
  @EventPattern('master/+/assert/#', Transport.MQTT)
  async receiveMockAssert(
    @Payload() data: string,
    @Ctx() context: MqttContext,
  ) {
    console.log(`receive Assert packet: `, context.getPacket());

    console.log(`receive value `, data);
  }
  /**
   * Todo: Slave 펌웨어 수정 이후 제거 예정 */
  @EventPattern('master/+/error', Transport.MQTT)
  async receiveError(@Payload() data: string, @Ctx() context: MqttContext) {
    console.log(`receive Error packet: `, context.getPacket());

    console.log(`receive value `, data);
  }
}
