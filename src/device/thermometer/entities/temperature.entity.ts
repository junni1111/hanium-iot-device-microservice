import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Slave } from '../../slave/entities/slave.entity';

@Entity('temperature_logs')
export class Temperature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  temperature: number;

  @Column({ name: 'slave_fk' })
  slave_fk: number;

  @JoinColumn({ name: 'slave_fk' })
  @ManyToOne((type) => Slave, (slave) => slave.temperatures)
  slave: Slave;

  @CreateDateColumn({ type: 'timestamptz', name: 'create_at' })
  createAt: Date;
}
