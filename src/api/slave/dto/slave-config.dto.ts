import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SlaveConfigDto {
  @ApiProperty()
  @IsNumber()
  masterId: number;

  @ApiProperty()
  @IsNumber()
  slaveId: number;

  @ApiProperty()
  @IsNumber()
  rangeBegin: number;

  @ApiProperty()
  @IsNumber()
  rangeEnd: number;

  @ApiProperty()
  @IsNumber()
  updateCycle: number;

  @ApiProperty()
  @IsNumber()
  waterPumpCycle: number;

  @ApiProperty()
  @IsNumber()
  waterPumpRuntime: number;

  @ApiProperty()
  @IsNumber()
  ledCycle: number;

  @ApiProperty()
  @IsNumber()
  ledRuntime: number;
}
