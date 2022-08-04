import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class AuthUserDto extends PickType(User, [
  'username',
  'email',
  'role',
] as const) {}
