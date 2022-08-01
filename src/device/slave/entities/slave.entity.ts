import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Master } from '../../master/entities/master.entity';
import { ThermometerConfig } from '../../thermometer/entities/thermometer.entity';
import { Temperature } from '../../thermometer/entities/temperature.entity';
import { WaterPumpConfig } from '../../water-pump/entities/water-pump.entity';
import { LedConfig } from '../../led/entities/led.entity';
import { IsNumber } from 'class-validator';

@Entity('slaves')
export class Slave {
  // @PrimaryGeneratedColumn({ type: 'integer' })
  // id: number;
  @PrimaryColumn({ type: 'integer' })
  @IsNumber()
  masterId: number;

  @PrimaryColumn({ type: 'integer' })
  @IsNumber()
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
  @OneToOne((type) => LedConfig, (led) => led.slave, {
    cascade: ['insert', 'update'],
  })
  ledConfig: LedConfig;

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
