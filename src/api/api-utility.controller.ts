import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { DeviceTemperatureService } from '../device/device-temperature.service';

@Controller()
export class ApiUtilityController {
  constructor(
    private readonly deviceTemperatureService: DeviceTemperatureService,
  ) {}

  @Get()
  healthCheck(@Res() res) {
    console.log(`Health Check`);
    return res.status(HttpStatus.OK).send('ok device');
  }

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
