import { EntityRepository, Repository } from 'typeorm';
import { Temperature } from '../entities/temperature-log.entity';
import { Master } from '../entities/master.entity';
import { Slave } from '../entities/slave.entity';
import { ThermometerConfig } from '../entities/thermometer.entity';

@EntityRepository(Temperature)
export class TemperatureRepository extends Repository<Temperature> {
  createLog(
    masterId: number,
    slaveId: number,
    temperature: number,
    createAt?: Date,
  ) {
    const log = this.create({
      slave: { masterId, slaveId },
      temperature,
      createAt,
    });
    return this.createQueryBuilder()
      .insert()
      .into(Temperature)
      .values(log)
      .execute();
  }

  findBySlave(masterId: number, slaveId: number) {
    return (
      this.createQueryBuilder('t')
        .leftJoinAndSelect('t.slave', 'slave')
        .select(['t.create_at AS x', 't.temperature AS y'])
        .where(`slave.masterId = :masterId`, { masterId })
        .andWhere(`slave.slaveId = :slaveId`, { slaveId })
        // .from(Thermometer, 'temperatures')
        // .limit(100000) // Todo: 제한 고민
        // .orderBy('create_at', 'ASC')
        .getRawMany()
    );
    // return this.find({
    //   relations: ['slave', 'slave.master'],
    //   where: { slave: { masterId, slaveId } },
    // });
    // return (
    //   this.createQueryBuilder('temperature_logs')
    //     .leftJoinAndSelect('temperature_logs.sensor', 'sensor')
    //     // .innerJoinAndSelect('temperature_logs.sensor', 'sensor')
    //     .getRawMany()
    // );
  }
}
