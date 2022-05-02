import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { DeviceTemperatureService } from '../device/device-temperature.service';

@Controller()
export class ApiUtilityController {
  constructor(
    private readonly deviceTemperatureService: DeviceTemperatureService,
  ) {}
  @MessagePattern('ping', Transport.TCP)
  async pingToDeviceMicroservice(@Payload() payload: string): Promise<string> {
    console.log(`Ping from api gateway`, payload);
    return 'pong';
  }

  @MessagePattern('test/temperature', Transport.TCP)
  async createTestTemperatureData() {
    console.log(`create test data...`);
    await this.deviceTemperatureService.createTestData();
    return 'create done';
  }
}
