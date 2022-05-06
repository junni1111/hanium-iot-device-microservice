import { Controller } from '@nestjs/common';
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
import { Temperature } from './entities/temperature.entity';
import { DeviceLedService } from './device-led.service';
import { DeviceTemperatureService } from './device-temperature.service';
import { DeviceWaterPumpService } from './device-water-pump.service';

@Controller()
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly pollingService: DevicePollingService,
    private readonly deviceLedService: DeviceLedService,
    private readonly deviceTemperatureService: DeviceTemperatureService,
    private readonly waterPumpService: DeviceWaterPumpService,
  ) {}

  @EventPattern(POLLING, Transport.MQTT)
  receivePollingResult(
    @Ctx() context: MqttContext,
    @Payload() pollingStatus: EPollingState,
  ) {
    const masterId = this.deviceService.getMasterId(context.getTopic());
    console.log(`polling from master: `, masterId);
    console.log(pollingStatus);
    this.pollingService.setPollingStatus(masterId, pollingStatus);
  }

  @EventPattern(TEMPERATURE, Transport.MQTT)
  async receiveTemperature(
    @Payload() temperature: number,
    @Ctx() context: MqttContext,
  ) {
    /**
     * Todo: 추후 사용자가 지정한 온도 범위값을
     *       감지할 수 있게 수정 */
    const MIN_AVAILABLE_TEMPERATURE = 20;
    const MAX_AVAILABLE_TEMPERATURE = 30;
    const [, masterId, , slaveId] = context.getTopic().split('/');

    try {
      if (
        temperature < MIN_AVAILABLE_TEMPERATURE ||
        temperature > MAX_AVAILABLE_TEMPERATURE
      ) {
        /**
         * Todo: Something Trigger
         * */
      }
      this.deviceTemperatureService.setCurrentTemperature(
        parseInt(masterId),
        parseInt(slaveId),
        temperature,
      );

      const data = await this.deviceTemperatureService.saveTemperature(
        new Temperature(parseInt(masterId), parseInt(slaveId), temperature),
      );

      console.log(
        this.deviceTemperatureService.getCurrentTemperature(
          parseInt(masterId),
          parseInt(slaveId),
        ),
      );
    } catch (e) {
      throw e;
    }
  }

  @EventPattern(SLAVE_STATE, Transport.MQTT)
  receiveSlaveState(@Payload() data: number, @Ctx() context: MqttContext) {
    console.log(`Recv State`);
    console.log(context.getTopic());
    console.log(context.getPacket());
    console.log('data:', data);
    // console.log('packet: ', context.getPacket());
  }
}
