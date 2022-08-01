import { EntityRepository, Repository } from 'typeorm';
import { ThermometerConfig } from '../thermometer/entities/thermometer.entity';
import {
  defaultSlaveConfig,
  ITemperatureConfig,
} from '../interfaces/slave-configs';

@EntityRepository(ThermometerConfig)
export class ThermometerRepository extends Repository<ThermometerConfig> {
  setConfigs(
    masterId: number,
    slaveId: number,
    configs: ITemperatureConfig = { ...defaultSlaveConfig },
  ) {
    const sensor = this.create({ slave: { masterId, slaveId }, ...configs });
    return this.save(sensor);
  }

  // setConfigs(masterId: number, slaveId: number, configs: ITemperatureConfig) {
  //   return (
  //     this.createQueryBuilder('t')
  //       // .leftJoinAndSelect('t.slave', 'slave')
  //       .update(ThermometerConfig)
  //       .set({ ...configs })
  //       .where('t.slave.masterId = :masterId', { masterId })
  //       .andWhere('t.slave.slaveId = :slaveId', { slaveId })
  //       .execute()
  //   );
  // }

  // getConfigs(masterId: number, slaveId: number) {}

  findBySlave(masterId: number, slaveId: number): Promise<ThermometerConfig> {
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
