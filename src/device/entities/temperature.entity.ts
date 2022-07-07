import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Slave } from './slave.entity';
import { TemperatureLog } from './temperature-log.entity';
import { ITemperatureConfig } from '../interfaces/slave-configs';

@Entity('temperature_sensors')
export class Temperature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  rangeBegin: number;

  @Column({ type: 'integer' })
  rangeEnd: number;

  @Column({ type: 'integer' })
  updateCycle: number;

  @OneToOne((type) => Slave, (slave) => slave.temperatureSensor)
  slave: Slave;

  @OneToMany((type) => TemperatureLog, (log) => log.sensor)
  logs: TemperatureLog[];

  @CreateDateColumn({ type: 'timestamptz', name: 'create_at' })
  createAt: Date;

  /** Todo: Refactor Interface */
  constructor(
    masterId: number,
    slaveId: number,
    configs: ITemperatureConfig,
    createDate?: Date,
  ) {
    const slave = new Slave();
    slave.slaveId = slaveId;
    this.slave = slave;

    this.rangeBegin = configs.startTemperatureRange;
    this.rangeEnd = configs.endTemperatureRange;
    this.updateCycle = configs.temperatureUpdateCycle;

    if (createDate) {
      this.createAt = createDate;
    }
  }
}
