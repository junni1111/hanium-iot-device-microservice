import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UTILITY } from '../util/constants/swagger';

@ApiTags(UTILITY)
@Controller()
export class ApiUtilityController {
  @Get('/')
  async healthCheck(@Res() res) {
    console.log(`Health Check`);
    return res.status(HttpStatus.OK).send('ok');
  }

  @Get('ping')
  async pingToDeviceMicroservice(@Query('ping') payload: string) {
    console.log(`Ping from api gateway`, payload);
    return 'device-pong';
  }
}
