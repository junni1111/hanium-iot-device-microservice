import { IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class TemperatureBetweenDto {
  @IsNumber()
  masterId: number;

  @IsNumber()
  slaveId: number;

  @Type(() => Date)
  @IsDate()
  begin: Date;

  @Type(() => Date)
  @IsDate()
  end: Date;
}
