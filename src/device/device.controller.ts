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
  SLAVE_STATE,
  TEMPERATURE,
} from '../util/constants/mqtt-topic';
import { EPollingState } from './interfaces/polling-status';
import { DevicePollingService } from './device-polling.service';
import { DeviceLedService } from './device-led.service';
import { DeviceTemperatureService } from './device-temperature.service';
import { DeviceWaterPumpService } from './device-water-pump.service';
import { Cache } from 'cache-manager';
import { Temperature } from './entities/temperature.entity';

@Controller()
export class DeviceController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly deviceService: DeviceService,
    private readonly pollingService: DevicePollingService,
    private readonly deviceLedService: DeviceLedService,
    private readonly deviceTemperatureService: DeviceTemperatureService,
    private readonly waterPumpService: DeviceWaterPumpService,
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
    await this.cacheManager.set<number>(key, pollingStatus, { ttl: 0 });
    // console.log(`캐싱 값: `, key, pollingStatus);

    /**
     * Todo: Refactor After Pass Test */
    // const masterId = this.deviceService.getMasterId(context.getTopic());
    // console.log(`polling from master: `, masterId);
    // console.log(pollingStatus);
    // this.pollingService.setPollingStatus(masterId, pollingStatus);
  }

  @EventPattern(TEMPERATURE, Transport.MQTT)
  async receiveTemperature(
    @Payload() temperature: number,
    @Ctx() context: MqttContext,
  ) {
    /**
     * Todo: 추후 사용자가 지정한 온도 범위값을
     *       감지할 수 있게 수정 */
    const MIN_AVAILABLE_TEMPERATURE = 10;
    const MAX_AVAILABLE_TEMPERATURE = 35;
    const [, masterId, , slaveId] = context.getTopic().split('/');

    try {
      if (
        temperature < MIN_AVAILABLE_TEMPERATURE ||
        temperature > MAX_AVAILABLE_TEMPERATURE
      ) {
        /**
         * Todo: Something Trigger
         * */
        console.log(`정상 온도 값 벗어남`);
        this.deviceTemperatureService.mockOverRangeTrigger(parseInt(masterId));
      }

      await this.deviceTemperatureService.cacheTemperature(
        parseInt(masterId),
        parseInt(slaveId),
        temperature,
      );

      /**
       * Todo: Handling data */
      await this.cacheManager.set<number>(context.getTopic(), temperature, {
        ttl: 0,
      });

      const data = await this.deviceTemperatureService.saveTemperature(
        new Temperature(parseInt(masterId), parseInt(slaveId), temperature),
      );
    } catch (e) {
      throw e;
    }
  }

  @EventPattern(SLAVE_STATE, Transport.MQTT)
  async receiveSlaveState(
    @Payload() data: string,
    @Ctx() context: MqttContext,
  ) {
    // console.log(`topic `, context.getTopic());
    // console.log(
    //   `before cached value `,
    //   await this.cacheManager.get<string>(context.getTopic()),
    // );
    if (data === 'on' || data === 'off') {
      await this.cacheManager.set<string>(context.getTopic(), data, { ttl: 0 });
    } else {
      console.log(`Slave State Event Exception. Payload is not 'on' or 'off'`);
    }
    console.log(`receive packet: `, context.getPacket());

    console.log(`receive value `, data);
  }
}
