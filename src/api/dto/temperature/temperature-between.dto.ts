import { IsDate, IsNumber } from 'class-validator';

export class TemperatureBetweenDto {
  @IsNumber()
  masterId: number;

  @IsNumber()
  slaveId: number;
  @IsDate()
  begin: Date;

  @IsDate()
  end: Date;
}
