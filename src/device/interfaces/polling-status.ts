export enum EPollingState {
  OK = 0x80,
  ERROR1 = 0x01,
  ERROR2,
}

export interface IGatewayStatus {
  state: EPollingState;
  pollingCount: number;
}
