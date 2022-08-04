import { EntityRepository, Repository } from 'typeorm';
import { WaterPumpConfig } from '../water-pump/entities/water-pump.entity';
import { Slave } from '../slave/entities/slave.entity';
import { WaterPumpConfigDto } from '../../api/water-pump/dto/water-pump-config.dto';

@EntityRepository(WaterPumpConfig)
export class WaterPumpRepository extends Repository<WaterPumpConfig> {
  updateConfig(slave: Slave, configDto: WaterPumpConfigDto) {
    const { waterPumpRuntime, waterPumpCycle } = configDto;

    return this.createQueryBuilder()
      .update(WaterPumpConfig)
      .set({ waterPumpCycle, waterPumpRuntime })
      .where('id = :id', { id: slave.waterPumpFK })
      .execute();
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
