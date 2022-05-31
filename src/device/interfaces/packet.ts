export enum ECommand {
  POLLING = 0xa0,
  READ = 0xc1,
  WRITE = 0xd1,
  EMERGENCY = 0xe0,
}

/*  TODO: Add locale future  */
export enum EGateway {
  SEOUL,
}

export enum EIndex {
  /*  TODO: Refactor after change protocol  */
  DEFAULT = 0x21,
  HIGH = 0x27,
}

export enum EDeviceId {
  MASTER = 0xff,
  SLAVE_TEST = 0x22,
  MASTER_SLAVE_ALL = 0,
}

export enum ESlaveRunCommand {
  OFF = 0x0f,
  ON = 0xfb,
  ON_ENABLE_EVENT_POLLING = 0xaa,
  ON_DISABLE_EVENT_POLLING = 0xaf,
}

export enum ESensorName {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  LUX = 'lux',
  WIND = 'wind',

  MOTOR = 'motor',
  LED = 'led',
  FAN = 'fan',

  CONTROL = 'control',
  INSIDE_LED = 'inside-led', // TODO: Rename

  /*  TODO: Add ETC...  */
}

export interface IBasePacket {
  readonly start: number;
  readonly index: number;
  readonly target_id: number;
  readonly command: ECommand;
  readonly data_length: number;
  readonly address_high: number;
  readonly address_low: number;
  readonly data_list: number[];
}
