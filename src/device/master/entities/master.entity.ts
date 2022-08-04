import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Slave } from '../../slave/entities/slave.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';

@Entity('masters')
export class Master {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsNumber()
  @Column({ unique: true, name: 'master_id' })
  masterId: number;

  @ApiProperty()
  @IsString()
  @Column({ type: 'varchar' })
  address: string;

  @ApiProperty()
  @IsDate()
  @CreateDateColumn({ type: 'timestamptz', name: 'create_at' })
  createAt: Date;

  @OneToMany((type) => Slave, (slave) => slave.master, {
    cascade: ['insert', 'update'],
  })
  slaves: Slave[];
}
