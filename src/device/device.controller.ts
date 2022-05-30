import { CACHE_MANAGER, Controller, Inject } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MqttContext,
  Payload,
  Transport,
} from '@nestjs/microservices';
import { DeviceService } from './device.service';
import {
  POLLING,
  SLAVE_RESPONSE,
  SLAVE_STATE,
  TEMPERATURE,
} from '../util/constants/mqtt-topic';
import { EPollingState } from './interfaces/polling-status';
import { DevicePollingService } from './device-polling.service';
import { DeviceTemperatureService } from './device-temperature.service';
import { Cache } from 'cache-manager';
import { Temperature } from './entities/temperature.entity';
import { ESlaveConfigTopic } from '../util/constants/api-topic';
import { DeviceFanService } from './device-fan.service';

@Controller()
export class DeviceController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly deviceService: DeviceService,
    private readonly pollingService: DevicePollingService,
    private readonly deviceTemperatureService: DeviceTemperatureService,
    private readonly deviceFanService: DeviceFanService,
  ) {}

  /**
   * Todo: Validate Polling Status Is Number */
  @EventPattern(POLLING, Transport.MQTT)
  async receivePollingResult(
    @Ctx() context: MqttContext,
    @Payload() pollingStatus: EPollingState,
  ) {
    const key = context.getTopic();
    // console.log(`이전 상태 값: `, await this.cacheManager.get<number>(key));

    if (pollingStatus !== EPollingState.OK) {
      /**
       * Todo: Trigger Some Mock Method */
      console.log(`Polling 값 문제 발생`);
      console.log(`추후 여기서 트리거 발생`);
      this.pollingService.mockPollingExceptionTrigger(context, pollingStatus);
    }

    /**
     * Todo: Cache Status To Redis */
    await this.cacheManager.set<number>(key, pollingStatus, { ttl: 60 });
    // console.log(`캐싱 값: `, key, pollingStatus);
  }

  @EventPattern(TEMPERATURE, Transport.MQTT)
  async receiveTemperature(
    @Payload() temperature: number,
    @Ctx() context: MqttContext,
  ) {
    console.log(`Recv Temperature`, temperature);
    /**
     * Todo: 추후 사용자가 지정한 온도 범위값을
     *       감지할 수 있게 수정 */

    const [, mId, , sId] = context.getTopic().split('/');
    const masterId = parseInt(mId); // 🤔
    const slaveId = parseInt(sId);

    try {
      /**
       * Todo: id로 캐싱된 온도 범위 가져옴
       *       캐싱된 범위 없으면 db 조회 */
      const [availableMin, availableMax] =
        await this.deviceTemperatureService.getTemperatureRange(
          masterId,
          slaveId,
        );

      if (temperature < availableMin || temperature > availableMax) {
        /**
         * Todo: Something Trigger
         * */
        console.log(`설정한 온도 값 벗어남`);
        // this.deviceTemperatureService.mockOverRangeTrigger(parseInt(masterId));
        await this.deviceFanService.requestMockFan(masterId, slaveId);
      }
      await this.deviceTemperatureService.cacheTemperature(
        masterId,
        slaveId,
        temperature,
      );

      const data = await this.deviceTemperatureService.saveTemperature(
        new Temperature(masterId, slaveId, temperature),
      );
    } catch (e) {
      throw e;
    }
  }

  @EventPattern(SLAVE_STATE, Transport.MQTT)
  async receiveSlaveState(
    @Payload() runtimeMinutes: number,
    @Ctx() context: MqttContext,
  ) {
    const [, masterId, , slaveId, sensorName] = context.getTopic().split('/');
    /**
     * Todo: Extract Service & cleanup */
    /**
     * Todo: Cache Power State oxd1 */
    // if ()
    console.log(`slave info: `, masterId, slaveId, sensorName);
    console.log(`salve runtime: `, runtimeMinutes);
    // const powerStateKey = `master/${masterId}/slave/${slaveId}/power/${sensorName}`;
    // console.log(`key: `, powerStateKey);
    // await this.cacheManager.set<string>(powerStateKey, 'on', {
    //   ttl: 0,
    // });
    if (runtimeMinutes > 0) {
      await this.cacheManager.set<string>(context.getTopic(), 'on', {
        ttl: runtimeMinutes * 60, // make minutes -> second
      });
    }
    console.log(`receive packet: `, context.getPacket());
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
      context.getPacket(),
    );

    console.log(`receive value `, data);
  }

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
