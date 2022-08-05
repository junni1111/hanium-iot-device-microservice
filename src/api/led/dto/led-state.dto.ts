import { PickType } from '@nestjs/swagger';
import { Slave } from '../../../device/slave/entities/slave.entity';

export class LedStateDto extends PickType(Slave, [
  'masterId',
  'slaveId',
] as const) {}
