import { SlavePowerDto } from '../slave/slave-power.dto';
import { PickType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';

export class FanPowerDto extends PickType(SlavePowerDto, [
  'masterId',
  'slaveId',
]) {
  @IsNumber()
  temperature: number;

  @IsNumber()
  availableMin: number;

  @IsNumber()
  availableMax;
}
