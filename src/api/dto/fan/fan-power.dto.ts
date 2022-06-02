import { SlavePowerDto } from '../slave/slave-power.dto';
import { PartialType } from '@nestjs/mapped-types';

export class FanPowerDto extends PartialType(SlavePowerDto) {}
