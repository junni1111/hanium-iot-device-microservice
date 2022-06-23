import { IsDateString, IsNumber } from 'class-validator';

export class TemperatureBetweenDto {
  @IsNumber()
  masterId: number;

  @IsNumber()
  slaveId: number;

  @IsDateString()
  begin: Date;

  @IsDateString()
  end: Date;
}
