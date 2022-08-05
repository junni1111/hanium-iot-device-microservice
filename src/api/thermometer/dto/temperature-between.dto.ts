import { IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TemperatureBetweenDto {
  @ApiProperty()
  @IsNumber()
  masterId: number;

  @ApiProperty()
  @IsNumber()
  slaveId: number;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  begin: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  end: Date;
}
