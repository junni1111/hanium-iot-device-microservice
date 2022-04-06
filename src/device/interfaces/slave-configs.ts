export interface ISlaveConfigs {
  startTemperatureRange: number;
  endTemperatureRange: number;
  temperatureUpdateCycle: number;
  waterPumpCycle: number;
  waterPumpRuntime: number;
  ledCycle: number;
  ledRuntime: number;
}

export const defaultSlaveConfig: ISlaveConfigs = {
  startTemperatureRange: 15,
  endTemperatureRange: 30,
  temperatureUpdateCycle: 30,
  waterPumpCycle: 3,
  waterPumpRuntime: 10,
  ledCycle: 3,
  ledRuntime: 10,
};

export type ILedConfig = Pick<ISlaveConfigs, 'ledCycle' | 'ledRuntime'>;

export type IWaterPumpConfig = Pick<
  ISlaveConfigs,
  'waterPumpCycle' | 'waterPumpRuntime'
>;

export type ITemperatureConfig = Pick<
  ISlaveConfigs,
  'startTemperatureRange' | 'endTemperatureRange' | 'temperatureUpdateCycle'
>;
