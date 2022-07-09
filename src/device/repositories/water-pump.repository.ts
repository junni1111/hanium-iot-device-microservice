import { EntityRepository, Repository } from 'typeorm';

import {
  defaultSlaveConfig,
  IWaterPumpConfig,
} from '../interfaces/slave-configs';
import { WaterPumpConfig } from '../entities/water-pump.entity';

@EntityRepository(WaterPumpConfig)
export class WaterPumpRepository extends Repository<WaterPumpConfig> {
  setConfigs(
    masterId: number,
    slaveId: number,
    configs: IWaterPumpConfig = { ...defaultSlaveConfig },
  ) {
    const sensor = this.create({ slave: { masterId, slaveId }, ...configs });
    return this.save(sensor);
  }

  findBySlave(masterId: number, slaveId: number): Promise<WaterPumpConfig> {
    return this.createQueryBuilder('water')
      .leftJoinAndSelect('water.slave', 'slave')
      .where(`slave.masterId = :masterId`, { masterId })
      .andWhere(`slave.slaveId = :slaveId`, { slaveId })
      .select(['water.waterPumpCycle', 'water.waterPumpRuntime'])
      .getOne();
  }
}
