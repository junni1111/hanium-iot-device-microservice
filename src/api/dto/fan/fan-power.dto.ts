import { SlavePowerDto } from '../slave/slave-power.dto';
import { PickType } from '@nestjs/mapped-types';

export class FanPowerDto extends PickType(SlavePowerDto, [
  'masterId',
  'slaveId',
]) {}
