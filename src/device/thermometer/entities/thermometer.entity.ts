import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Slave } from '../../slave/entities/slave.entity';

@Entity('thermometer_configs')
export class ThermometerConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  rangeBegin: number;

  @Column({ type: 'integer' })
  rangeEnd: number;

  @Column({ type: 'integer' })
  updateCycle: number;

  @OneToOne((type) => Slave, (slave) => slave.thermometerConfig, {
    cascade: true,
  })
  slave: Slave;

  @CreateDateColumn({ type: 'timestamptz', name: 'create_at' })
  createAt: Date;
}
