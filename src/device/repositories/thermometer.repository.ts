import { EntityRepository, Repository } from 'typeorm';
import { ThermometerConfig } from '../entities/thermometer.entity';
import { subDays, subMinutes } from 'date-fns';
import { Master } from '../entities/master.entity';
import { Slave } from '../entities/slave.entity';
import { ITemperatureConfig } from '../interfaces/slave-configs';

@EntityRepository(ThermometerConfig)
export class ThermometerRepository extends Repository<ThermometerConfig> {
  insertThermometer(
    masterId: number,
    slaveId: number,
    configs: ITemperatureConfig,
  ) {
    const master = new Master();
    master.id = masterId;
    const slave = new Slave();
    slave.slaveId = slaveId;
    slave.master = master;
    const sensor = this.create({});
    return;
  }
}
