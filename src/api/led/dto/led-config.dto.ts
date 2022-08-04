import { PickType } from '@nestjs/swagger';
import { SlaveConfigDto } from '../../slave/dto/slave-config.dto';

export class LedConfigDto extends PickType(SlaveConfigDto, [
  'masterId',
  'slaveId',
  'ledCycle',
  'ledRuntime',
] as const) {}
