import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Slave } from '../../slave/entities/slave.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

@Entity('masters')
export class Master {
  @ApiProperty()
  @PrimaryColumn({ type: 'integer' })
  @IsNumber()
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar' })
  @IsString()
  address: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'create_at' })
  createAt: Date;

  @OneToMany((type) => Slave, (slave) => slave.master, {
    cascade: ['insert', 'update'],
  })
  slaves: Slave[];
}
