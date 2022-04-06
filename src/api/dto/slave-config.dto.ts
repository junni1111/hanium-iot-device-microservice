import { IsNumber } from 'class-validator';
export class SlaveConfigDto {
  @IsNumber()
  masterId: number;

  @IsNumber()
  slaveId: number;

  @IsNumber()
  startTemperatureRange: number;

  @IsNumber()
  endTemperatureRange: number;

  @IsNumber()
  temperatureUpdateCycle: number;

  @IsNumber()
  waterPumpCycle: number;

  @IsNumber()
  waterPumpRuntime: number;

  @IsNumber()
  ledCycle: number;

  @IsNumber()
  ledRuntime: number;
}
