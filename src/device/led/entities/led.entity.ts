import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Slave } from '../../slave/entities/slave.entity';

@Entity('led_configs')
export class LedConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  ledCycle: number;

  @Column({ type: 'integer' })
  ledRuntime: number;

  @OneToOne((type) => Slave, (slave) => slave.ledConfig, {
    cascade: true,
  })
  slave: Slave;

  @CreateDateColumn({ type: 'timestamptz', name: 'create_at' })
  createAt: Date;
}
