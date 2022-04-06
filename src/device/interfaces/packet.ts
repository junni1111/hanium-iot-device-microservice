export enum ECommand {
  POLLING = 0xa0,
  READ = 0xc1,
  WRITE = 0xd1,
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
  MASTER_SLAVE = 0,
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
  readonly command: number;
  readonly data_length: number;
  readonly address_high: number;
  readonly address_low: number;
  readonly data_list: number[];
}
