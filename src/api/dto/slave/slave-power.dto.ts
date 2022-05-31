import { IsIn, IsNumber, IsString } from 'class-validator';

/** Abstract OR Partial */
export abstract class SlavePowerDto {
  @IsNumber()
  readonly masterId: number;

  @IsNumber()
  readonly slaveId: number;

  @IsString()
  @IsIn(['on', 'off'], {
    message: `'powerState' is not 'on' or 'off'`,
  })
  readonly powerState: string;
}
