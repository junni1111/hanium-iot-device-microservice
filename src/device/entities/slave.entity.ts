import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Master } from './master.entity';
import { ISlaveConfigs } from '../interfaces/slave-configs';
import { Temperature } from './temperature.entity';

@Entity()
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

  @ManyToOne((type) => Master, (master) => master.slaves, {
    onDelete: 'CASCADE',
  })
  master: Master;

  @OneToOne((type) => Temperature, (sensor) => sensor.slave)
  temperatureSensor: Temperature;

  static createSlave(
    masterId: number,
    slaveId: number,
    {
      startTemperatureRange,
      endTemperatureRange,
      temperatureUpdateCycle,
      waterPumpCycle,
      waterPumpRuntime,
      ledRuntime,
      ledCycle,
    }: ISlaveConfigs,
  ) {
    const master = new Master();
    master.id = masterId;

    const slave = new Slave();
    slave.slaveId = slaveId;
    slave.startTemperatureRange = startTemperatureRange;
    slave.endTemperatureRange = endTemperatureRange;
    slave.temperatureUpdateCycle = temperatureUpdateCycle;
    slave.waterPumpCycle = waterPumpCycle;
    slave.waterPumpRuntime = waterPumpRuntime;
    slave.ledCycle = ledCycle;
    slave.ledRuntime = ledRuntime;

    slave.master = master;

    return slave;
  }
}
