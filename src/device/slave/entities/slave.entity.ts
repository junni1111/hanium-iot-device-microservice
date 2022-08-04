import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Master } from '../../master/entities/master.entity';
import { ThermometerConfig } from '../../thermometer/entities/thermometer.entity';
import { Temperature } from '../../thermometer/entities/temperature.entity';
import { WaterPumpConfig } from '../../water-pump/entities/water-pump.entity';
import { LedConfig } from '../../led/entities/led.entity';
import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity('slaves')
export class Slave {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsNumber()
  @Column({ name: 'master_id' })
  masterId: number;

  @ApiProperty()
  @IsNumber()
  @Column({ name: 'slave_id' })
  slaveId: number;

  @JoinColumn({ name: 'master_fk', referencedColumnName: 'id' })
  @ManyToOne((type) => Master, (master) => master.slaves, {
    onDelete: 'CASCADE',
    // eager: true,
  })
  master: Master;

  @Column({ name: 'water_config_fk', type: 'integer', nullable: true })
  waterPumpFK: number;

  @JoinColumn({ name: 'water_config_fk' })
  @OneToOne((type) => WaterPumpConfig, (waterPump) => waterPump.slave, {
    cascade: ['insert', 'update'],
  })
  waterConfig: WaterPumpConfig;

  @Column({ name: 'led_config_fk', type: 'integer', nullable: true })
  ledFK: number;

  @JoinColumn({ name: 'led_config_fk' })
  @OneToOne((type) => LedConfig, (led) => led.slave, {
    cascade: ['insert', 'update'],
  })
  ledConfig: LedConfig;

  @Column({ name: 'thermometer_config_fk', type: 'integer', nullable: true })
  thermometerFK: number;

  @JoinColumn({ name: 'thermometer_config_fk' })
  @OneToOne((type) => ThermometerConfig, (thermometer) => thermometer.slave, {
    cascade: ['insert', 'update'],
  })
  thermometerConfig: ThermometerConfig;

  @OneToMany((type) => Temperature, (temperature) => temperature.slave)
  temperatures: Temperature[];

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz', name: 'create_at' })
  createAt: Date;
}
