export class CreateSlaveDto {
  constructor(readonly masterId: number, readonly slaveId: number) {}
}
