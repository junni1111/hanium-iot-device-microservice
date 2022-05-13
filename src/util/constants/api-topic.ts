export enum ESlaveConfigTopic {
  ALL = 'config',
  TEMPERATURE = 'config/temperature',
  WATER_PUMP = 'config/water',
  LED = 'config/led',
}

export enum ESlaveTurnPowerTopic {
  WATER_PUMP = 'power/water',
  LED = 'power/led',
}

export enum EPowerState {
  ON = 'on',
  OFF = 'off',
}

export enum ESensor {
  LED = 'led',
  WATER_PUMP = 'water',
}

export const TEMPERATURE_WEEK = 'temperature/week';
