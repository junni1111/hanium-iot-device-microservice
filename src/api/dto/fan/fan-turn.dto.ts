import { EPowerState } from '../../../util/constants/api-topic';

export class FanTurnDto {
  constructor(
    public readonly masterId: number,
    public readonly slaveId: number,
    public readonly powerState: EPowerState,
  ) {}
}
