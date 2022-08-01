import { PickType } from '@nestjs/swagger';
import { Master } from '../../../device/master/entities/master.entity';

export class CreateMasterDto extends PickType(Master, [
  'id',
  'address',
] as const) {}
