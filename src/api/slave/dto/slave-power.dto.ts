import { IsIn, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SlavePowerDto {
  @ApiProperty()
  @IsNumber()
  readonly masterId: number;

  @ApiProperty()
  @IsNumber()
  readonly slaveId: number;

  @ApiProperty()
  @IsString()
  @IsIn(['on', 'off'], {
    message: `'powerState' is not 'on' or 'off'`,
  })
  readonly powerState: string;
}
