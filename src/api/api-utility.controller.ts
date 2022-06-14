import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { DeviceTemperatureService } from '../device/thermometer/device-temperature.service';
import { SlaveStateDto } from './dto/slave/slave-state.dto';

@Controller()
export class ApiUtilityController {
  constructor(
    private readonly deviceTemperatureService: DeviceTemperatureService,
  ) {}

  @Get()
  async healthCheck(@Res() res) {
    console.log(`Health Check`);
    return res.status(HttpStatus.OK).send('ok device');
  }

  @MessagePattern('ping', Transport.TCP)
  async pingToDeviceMicroservice(@Payload() payload: string): Promise<string> {
    console.log(`Ping from api gateway`, payload);
    return 'pong';
  }

  @MessagePattern('test/temperature', Transport.TCP)
  async createTestTemperatureData(@Payload() slaveStateDto: SlaveStateDto) {
    console.log(`create test data...`, slaveStateDto);

    return await this.deviceTemperatureService.createTestData(
      slaveStateDto.masterId,
      slaveStateDto.slaveId,
    );
  }
}
