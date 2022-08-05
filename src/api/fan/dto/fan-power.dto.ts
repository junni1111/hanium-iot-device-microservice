import { SlavePowerDto } from '../../slave/dto/slave-power.dto';
import { PartialType } from '@nestjs/mapped-types';

export class FanPowerDto extends PartialType(SlavePowerDto) {}
