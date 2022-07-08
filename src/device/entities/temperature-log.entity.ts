import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Temperature } from './temperature.entity';

@Entity('temperature_logs')
export class TemperatureLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  temperature: number;

  @ManyToOne((type) => Temperature, (sensor) => sensor.logs)
  sensor: Temperature;

  @CreateDateColumn({ type: 'timestamptz', name: 'create_at' })
  createAt: Date;

  constructor(sensor: Temperature, temperature: number, createDate?: Date) {
    this.sensor = sensor;
    this.temperature = temperature;

    if (createDate) {
      this.createAt = createDate;
    }
  }
}
