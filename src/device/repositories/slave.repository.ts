import { EntityRepository, Repository } from 'typeorm';
import { Slave } from '../entities/slave.entity';

@EntityRepository(Slave)
export class SlaveRepository extends Repository<Slave> {
  createSlave(masterId: number, slaveId: number) {
    try {
      const slave = this.create({
        masterId,
        slaveId,
      });
      return this.save(slave);
    } catch (e) {
      console.log(e);
    }
  }

  getConfigs(masterId: number, slaveId: number) {
    return this.createQueryBuilder('slave')
      .where(`slave.masterId = :masterId`, { masterId })
      .andWhere(`slave.slaveId = :slaveId`, { slaveId })
      .leftJoinAndSelect('slave.thermometerConfig', 't')
      .leftJoinAndSelect('slave.ledConfig', 'led')
      .leftJoinAndSelect('slave.waterConfig', 'water')
      .select([
        't.rangeBegin AS rangeBegin',
        't.rangeEnd AS rangeEnd',
        't.updateCycle AS updateCycle',
        'led.ledCycle AS ledCycle',
        'led.ledRuntime AS ledRuntime',
        'water.waterPumpCycle AS waterPumpCycle',
        'water.waterPumpRuntime AS waterPumpRuntime',
      ])
      .getRawOne();
  }

  // async setConfig(
  //   masterId: number,
  //   slaveId: number,
  //   configs: Partial<ISlaveConfigs>,
  // ) {
  //   try {
  //     const result = await this.createQueryBuilder()
  //       .update(Slave)
  //       .set(configs)
  //       .where('masterId = :masterId', { masterId })
  //       .andWhere('slaveId = :slaveId', { slaveId })
  //       .execute();
  //
  //     return result;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
  //
  // async getConfigs(masterId: number, slaveId: number) {
  //   try {
  //     return [];
  //     // return this.findOne({
  //     //   select: [
  //     //     'startTemperatureRange',
  //     //     'endTemperatureRange',
  //     //     'temperatureUpdateCycle',
  //     //     'waterPumpCycle',
  //     //     'waterPumpRuntime',
  //     //     'ledCycle',
  //     //     'ledRuntime',
  //     //   ],
  //     //   where: { master: { id: masterId }, slaveId },
  //     // });
  //   } catch (e) {
  //     console.log(`DB Exception: `, e);
  //   }
  // }
  //
  // async setOptimizeConfigs(masterId: number, slaveId: number) {
  //   try {
  //     /* TODO: Extract After Demo */
  //     const optimizeValue = defaultSlaveConfig;
  //
  //     const result = await this.createQueryBuilder()
  //       .update(Slave)
  //       .set(optimizeValue)
  //       .where('masterId = :masterId', { masterId })
  //       .andWhere('id = :slaveId', { slaveId })
  //       .execute();
  //
  //     return result;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
  //
  async deleteSlave(masterId: number, slaveId: number) {
    return this.createQueryBuilder()
      .delete()
      .from(Slave)
      .where(`masterId = :masterId`, { masterId })
      .andWhere(`slaveId = :slaveId`, { slaveId })
      .execute();
  }
}
