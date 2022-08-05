import { PickType } from '@nestjs/swagger';
import { Slave } from '../../../device/slave/entities/slave.entity';

export class WaterPumpStateDto extends PickType(Slave, [
  'masterId',
  'slaveId',
] as const) {}
