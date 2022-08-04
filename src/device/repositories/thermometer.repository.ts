import { EntityRepository, Repository } from 'typeorm';
import { ThermometerConfig } from '../thermometer/entities/thermometer.entity';
import { Slave } from '../slave/entities/slave.entity';
import { TemperatureConfigDto } from '../../api/thermometer/dto/temperature-config.dto';

@EntityRepository(ThermometerConfig)
export class ThermometerRepository extends Repository<ThermometerConfig> {
  updateConfig(slave: Slave, configDto: TemperatureConfigDto) {
    const { rangeBegin, rangeEnd, updateCycle } = configDto;

    return this.createQueryBuilder()
      .update(ThermometerConfig)
      .set({ rangeBegin, rangeEnd, updateCycle })
      .where('id = :id', { id: slave.thermometerFK })
      .execute();
  }

  findBySlave(masterId: number, slaveId: number): Promise<ThermometerConfig> {
    return this.createQueryBuilder('t')
      .leftJoinAndSelect('t.slave', 'slave')
      .where(`slave.masterId = :masterId`, { masterId })
      .andWhere(`slave.slaveId = :slaveId`, { slaveId })
      .select(['t.rangeBegin', 't.rangeEnd'])
      .getOne();
  }
}
