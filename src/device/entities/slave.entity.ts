import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Master } from './master.entity';
import { ISlaveConfigs } from '../interfaces/slave-configs';
import { Temperature } from './temperature.entity';

@Entity('slaves')
export class Slave {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'integer' })
  slaveId: number;

  @Column({ type: 'integer' })
  startTemperatureRange: number;

  @Column({ type: 'integer' })
  endTemperatureRange: number;

  @Column({ type: 'integer' })
  temperatureUpdateCycle: number;

  @Column({ type: 'integer' })
  waterPumpCycle: number;

  @Column({ type: 'integer' })
  waterPumpRuntime: number;

  @Column({ type: 'integer' })
  ledCycle: number;

  @Column({ type: 'integer' })
  ledRuntime: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'create_at' })
  createAt: Date;

  @Column({ type: 'int', nullable: true })
  masterId: number;

  @JoinColumn({ name: 'masterId' })
  @ManyToOne((type) => Master, (master) => master.slaves, {
    onDelete: 'CASCADE',
    eager: true,
  })
  master: Master;

  // @OneToOne((type) => Temperature, (sensor) => sensor.slave)
  // temperatureSensor: Temperature;

  static createSlave(
    masterId: number,
    slaveId: number,
    configs: Partial<ISlaveConfigs>,
  ) {
    const master = new Master();
    master.id = masterId;

    const slave = new Slave();
    slave.slaveId = slaveId;
    slave.startTemperatureRange = configs?.startTemperatureRange;
    slave.endTemperatureRange = configs?.endTemperatureRange;
    slave.temperatureUpdateCycle = configs?.temperatureUpdateCycle;
    slave.waterPumpCycle = configs?.waterPumpCycle;
    slave.waterPumpRuntime = configs?.waterPumpRuntime;
    slave.ledCycle = configs?.ledCycle;
    slave.ledRuntime = configs?.ledRuntime;

    slave.master = master;

    return slave;
  }
}
