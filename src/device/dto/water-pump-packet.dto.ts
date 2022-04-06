import { IBasePacket } from '../interfaces/packet';

export class WaterPumpPacketDto implements Partial<IBasePacket> {
  constructor(
    readonly start: number,
    readonly index: number,
    readonly target_id: number,
    readonly command: number,
    readonly data_length: number,
    readonly address_high: number,
    readonly address_low: number,
    readonly data_list: number[],
  ) {}
}
