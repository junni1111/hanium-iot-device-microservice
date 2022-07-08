import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { DeviceTemperatureService } from '../device/thermometer/device-temperature.service';
import { SlaveStateDto } from './dto/slave/slave-state.dto';
import { TemperatureBetweenDto } from './dto/temperature/temperature-between.dto';

@Controller()
export class ApiUtilityController {
  constructor(
    private readonly deviceTemperatureService: DeviceTemperatureService,
  ) {}

  @Get()
  async healthCheck(@Res() res) {
    console.log(`Health Check`);
    return res.status(HttpStatus.OK).send('ok');
  }

  @MessagePattern('ping', Transport.TCP)
  async pingToDeviceMicroservice(@Payload() payload: string): Promise<string> {
    console.log(`Ping from api gateway`, payload);
    return 'device-pong';
  }

  @MessagePattern('test/temperature', Transport.TCP)
  async createTestTemperatureData(
    @Payload() temperatureBetweenDto: TemperatureBetweenDto,
  ) {
    console.log(`create test data...`, temperatureBetweenDto);

    const value = await this.deviceTemperatureService.createTestData(
      temperatureBetweenDto,
    );
    console.log(value.length);
    return value;
  }
}
