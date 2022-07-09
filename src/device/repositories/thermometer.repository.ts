import { EntityRepository, Repository } from 'typeorm';
import { ThermometerConfig } from '../entities/thermometer.entity';
import {
  defaultSlaveConfig,
  ITemperatureConfig,
} from '../interfaces/slave-configs';

@EntityRepository(ThermometerConfig)
export class ThermometerRepository extends Repository<ThermometerConfig> {
  createThermometer(
    masterId: number,
    slaveId: number,
    configs: ITemperatureConfig = { ...defaultSlaveConfig },
  ) {
    const sensor = this.create({ slave: { masterId, slaveId }, ...configs });
    return this.save(sensor);
  }

  // getConfigs(masterId: number, slaveId: number) {}

  findBySlave(masterId: number, slaveId: number) {
    return this.createQueryBuilder('t')
      .leftJoinAndSelect('t.slave', 'slave')
      .where(`slave.masterId = :masterId`, { masterId })
      .andWhere(`slave.slaveId = :slaveId`, { slaveId })
      .select(['t.rangeBegin', 't.rangeEnd'])
      .getOne();
    // .select(['rangeBegin', 'rangeEnd'])
    // .from(ThermometerConfig);

    //   return this.findOne({
    //     select: ['id', 'rangeBegin', 'rangeEnd'],
    //     relations: ['slave'],
    //     where: { slave: { masterId, slaveId } },
    //   });
  }
}
