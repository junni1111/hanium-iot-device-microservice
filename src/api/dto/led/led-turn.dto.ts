import { EPowerState } from '../../../util/constants/api-topic';

export class LedTurnDto {
  constructor(
    public readonly masterId: number,
    public readonly slaveId: number,
    public readonly powerState: EPowerState,
  ) {}
}
