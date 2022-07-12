import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('temperatures')
export class Temperature {
  @PrimaryColumn({ type: 'integer', name: 'master_id' })
  masterId: number;

  @PrimaryColumn({ type: 'integer', name: 'slave_id' })
  slaveId: number;

  @Column({ type: 'float' })
  temperature: number;

  // @PrimaryColumn({type: 'timestamptz', name: 'create_at', })
  @CreateDateColumn({ type: 'timestamptz', name: 'create_at', primary: true })
  createAt: Date;
}
