export interface ISlaveConfigs {
  rangeBegin: number;
  rangeEnd: number;
  updateCycle: number;
  waterPumpCycle: number;
  waterPumpRuntime: number;
  ledCycle: number;
  ledRuntime: number;
}

export const defaultSlaveConfig: ISlaveConfigs = {
  rangeBegin: 15,
  rangeEnd: 30,
  updateCycle: 30,
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
  'rangeBegin' | 'rangeEnd' | 'updateCycle'
>;
