import { IsNumber } from 'class-validator';
export class SlaveConfigDto {
  @IsNumber()
  masterId: number;

  @IsNumber()
  slaveId: number;

  @IsNumber()
  rangeBegin: number;

  @IsNumber()
  rangeEnd: number;

  @IsNumber()
  updateCycle: number;

  @IsNumber()
  waterPumpCycle: number;

  @IsNumber()
  waterPumpRuntime: number;

  @IsNumber()
  ledCycle: number;

  @IsNumber()
  ledRuntime: number;
}
