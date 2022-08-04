import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsObject } from 'class-validator';
import { Master } from '../../../device/master/entities/master.entity';
import { AuthUserDto } from '../../../users/dto/auth-user.dto';

export class CreateMasterDto extends PickType(Master, [
  'masterId',
  'address',
] as const) {
  @ApiProperty({ nullable: true })
  @IsObject()
  user?: AuthUserDto;
}
