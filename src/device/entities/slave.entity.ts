import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Master } from './master.entity';
import { ThermometerConfig } from './thermometer.entity';
import { Temperature } from './temperature-log.entity';
import { WaterPumpConfig } from './water-pump.entity';

@Entity('slaves')
export class Slave {
  // @PrimaryGeneratedColumn({ type: 'integer' })
  // id: number;
  @PrimaryColumn({ type: 'integer' })
  masterId: number;

  @PrimaryColumn({ type: 'integer' })
  slaveId: number;

  @JoinColumn({ name: 'masterId' })
  @ManyToOne((type) => Master, (master) => master.slaves, {
    onDelete: 'CASCADE',
    // eager: true,
  })
  master: Master;

  @JoinColumn()
  @OneToOne((type) => WaterPumpConfig, (waterPump) => waterPump.slave, {
    cascade: ['insert', 'update'],
  })
  waterConfig: WaterPumpConfig;

  @JoinColumn()
  @OneToOne((type) => ThermometerConfig, (thermometer) => thermometer.slave, {
    cascade: ['insert', 'update'],
  })
  thermometerConfig: ThermometerConfig;

  @OneToMany((type) => Temperature, (temperature) => temperature.slave)
  temperatures: Temperature[];

  @CreateDateColumn({ type: 'timestamptz', name: 'create_at' })
  createAt: Date;
}
