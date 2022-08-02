import { EntityRepository, Repository } from 'typeorm';
import { defaultSlaveConfig, ILedConfig } from '../interfaces/slave-configs';
import { LedConfig } from '../led/entities/led.entity';

@EntityRepository(LedConfig)
export class LedRepository extends Repository<LedConfig> {
  setConfig(
    masterId: number,
    slaveId: number,
    configs: ILedConfig = { ...defaultSlaveConfig },
  ) {
    const sensor = this.create({ slave: { masterId, slaveId }, ...configs });
    return this.save(sensor);
  }

  findBySlave(masterId: number, slaveId: number): Promise<LedConfig> {
    return this.createQueryBuilder('led')
      .leftJoinAndSelect('led.slave', 'slave')
      .where(`slave.masterId = :masterId`, { masterId })
      .andWhere(`slave.slaveId = :slaveId`, { slaveId })
      .select(['led.ledCycle', 'led.ledRuntime'])
      .getOne();
  }

  clearLedDB() {
    return this.createQueryBuilder().delete().execute();
  }
}
