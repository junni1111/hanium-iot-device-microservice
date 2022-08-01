import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Humidity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'integer', name: 'master_id' })
  masterId: number;

  @Column({ type: 'integer', name: 'slave_id' })
  slaveId: number;

  @Column({ type: 'float' })
  humidity: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'create_at' })
  createDate: Date;

  constructor(masterId: number, slaveId: number, humidity: number) {
    this.masterId = masterId;
    this.slaveId = slaveId;
    this.humidity = humidity;
  }
}
