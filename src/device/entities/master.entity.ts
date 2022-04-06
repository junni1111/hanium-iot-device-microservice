import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Slave } from './slave.entity';

@Entity()
export class Master {
  @PrimaryColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar' })
  address: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'create_at' })
  createAt: Date;

  @OneToMany((type) => Slave, (slave) => slave.master)
  slaves: Slave[];

  static createMaster(masterId: number, address: string) {
    const master = new Master();
    master.id = masterId;
    master.address = address;

    return master;
  }
}
