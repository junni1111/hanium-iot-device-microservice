import { EntityRepository, Repository } from 'typeorm';
import { Slave } from './entities/slave.entity';
import { Master } from '../master/entities/master.entity';
import { LedConfig } from '../led/entities/led.entity';
import { WaterPumpConfig } from '../water-pump/entities/water-pump.entity';
import { ThermometerConfig } from '../thermometer/entities/thermometer.entity';

@EntityRepository(Slave)
export class SlaveRepository extends Repository<Slave> {
  async createSlave(
    master: Master,
    slaveId: number,
    ledConfig: LedConfig,
    waterConfig: WaterPumpConfig,
    thermometerConfig: ThermometerConfig,
  ) {
    try {
      const slave = this.create({
        master,
        masterId: master.masterId,
        slaveId,
        ledConfig,
        waterConfig,
        thermometerConfig,
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

  async deleteSlave(masterId: number, slaveId: number) {
    return this.createQueryBuilder()
      .delete()
      .from(Slave)
      .where(`masterId = :masterId`, { masterId })
      .andWhere(`slaveId = :slaveId`, { slaveId })
      .execute();
  }
}
