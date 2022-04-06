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
    this.pollingService.setPollingStatus(masterId, pollingStatus);
  }

  @EventPattern(TEMPERATURE, Transport.MQTT)
  async receiveTemperature(
    @Payload() temperature: number,
    @Ctx() context: MqttContext,
  ) {
    const [, masterId, , slaveId] = context.getTopic().split('/');

    /* TODO: If temperature < ??
     *       THEN  ~~~ */
    try {
      const data = await this.deviceTemperatureService.saveTemperature(
        new Temperature(
          Number(parseInt(masterId).toString(16)),
          Number(parseInt(slaveId).toString(16)),
          temperature,
        ),
      );
      await this.deviceTemperatureService.saveTemperature(data);
    } catch (e) {
      throw e;
    }
  }

  @EventPattern(SLAVE_STATE, Transport.MQTT)
  receiveSlaveState(@Payload() data: string, @Ctx() context: MqttContext) {
    console.log(`Recv State`);
    console.log(context.getTopic());
    console.log('data:', data);
    console.log('packet: ', context.getPacket());
  }
}
