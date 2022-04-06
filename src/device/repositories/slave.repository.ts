import { EntityRepository, Repository } from 'typeorm';
import { Slave } from '../entities/slave.entity';
import { defaultSlaveConfig, ISlaveConfigs } from '../interfaces/slave-configs';
import { CreateSlaveDto } from '../../api/dto/create-slave.dto';

@EntityRepository(Slave)
export class SlaveRepository extends Repository<Slave> {
  async createSlave({ masterId, slaveId }: CreateSlaveDto) {
    try {
      const slave = this.create(
        Slave.createSlave(masterId, slaveId, defaultSlaveConfig),
      );

      return this.save(slave);
    } catch (e) {
      console.log(e);
    }
  }

  async setConfig(
    masterId: number,
    slaveId: number,
    configs: Partial<ISlaveConfigs>,
  ) {
    try {
      const result = await this.createQueryBuilder()
        .update(Slave)
        .set(configs)
        .where('masterId = :masterId', { masterId })
        .andWhere('slaveId = :slaveId', { slaveId })
        .execute();

      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async getConfigs(masterId: number, slaveId: number) {
    try {
      return this.findOne({
        select: [
          'startTemperatureRange',
          'endTemperatureRange',
          'temperatureUpdateCycle',
          'waterPumpCycle',
          'waterPumpRuntime',
          'ledCycle',
          'ledRuntime',
        ],
        where: { master: { id: masterId }, slaveId },
      });
    } catch (e) {
      console.log(e);
    }
  }

  async setOptimizeConfigs(masterId: number, slaveId: number) {
    try {
      /* TODO: Extract After Demo */
      const optimizeValue = defaultSlaveConfig;

      const result = await this.createQueryBuilder()
        .update(Slave)
        .set(optimizeValue)
        .where('masterId = :masterId', { masterId })
        .andWhere('id = :slaveId', { slaveId })
        .execute();

      return result;
    } catch (e) {
      console.log(e);
    }
  }
}
