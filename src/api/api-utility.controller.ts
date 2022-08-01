import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { DeviceTemperatureService } from '../device/thermometer/device-temperature.service';
import { ApiTags } from '@nestjs/swagger';
import { UTILITY } from '../util/constants/swagger';

@ApiTags(UTILITY)
@Controller()
export class ApiUtilityController {
  constructor(
    private readonly deviceTemperatureService: DeviceTemperatureService,
  ) {}

  @Get('/')
  async healthCheck(@Res() res) {
    console.log(`Health Check`);
    return res.status(HttpStatus.OK).send('ok');
  }

  @Get('/ping')
  async pingToDeviceMicroservice(
    @Query('ping') payload: string,
  ): Promise<string> {
    console.log(`Ping from api gateway`, payload);
    return 'device-pong';
  }

  // @MessagePattern('test/temperature', Transport.TCP)
  // async createTestTemperatureData(@Payload() slaveStateDto: SlaveStateDto) {
  //   console.log(`create test data...`, slaveStateDto);
  //
  //   return await this.deviceTemperatureService.createTestData(
  //     slaveStateDto.masterId,
  //     slaveStateDto.slaveId,
  //   );
  // }
}
