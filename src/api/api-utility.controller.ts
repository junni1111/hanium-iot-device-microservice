import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UTILITY } from '../util/constants/swagger';

@ApiTags(UTILITY)
@Controller()
export class ApiUtilityController {
  @Get('/')
  async healthCheck() {
    console.log(`Health Check`);
    return 'ok';
  }

  @Get('ping')
  async pingToDeviceMicroservice(@Query('ping') payload: string) {
    console.log(`Ping from api gateway`, payload);
    return 'device-pong';
  }
}
