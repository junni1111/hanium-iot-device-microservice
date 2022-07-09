import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Slave } from './slave.entity';

@Entity('temperature_logs')
export class Temperature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  temperature: number;

  @ManyToOne((type) => Slave, (slave) => slave.temperatures, { cascade: true })
  slave: Slave;

  @CreateDateColumn({ type: 'timestamptz', name: 'create_at' })
  createAt: Date;
}
