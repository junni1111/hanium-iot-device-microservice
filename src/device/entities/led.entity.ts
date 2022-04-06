import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Led {
  @PrimaryColumn({ type: 'integer', name: 'master_id' })
  masterId: number;

  @PrimaryColumn({ type: 'integer', name: 'slave_id' })
  slaveId: number;

  @Column({ type: 'integer', name: 'run_time' })
  runtime: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'create_at' })
  createAt: Date;

  constructor(masterId: number, slaveId: number, runTime: number) {
    this.masterId = masterId;
    this.slaveId = slaveId;
    this.runtime = runTime;
  }
}
