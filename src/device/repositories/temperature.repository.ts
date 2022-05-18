import { createQueryBuilder, EntityRepository, Repository } from 'typeorm';
import { Temperature } from '../entities/temperature.entity';
import { subDays, subMinutes } from 'date-fns';

@EntityRepository(Temperature)
export class TemperatureRepository extends Repository<Temperature> {
  async fetchTemperatureLastWeek(
    masterId: number,
    slaveId: number,
  ): Promise<Temperature[]> {
    const now = new Date();

    const result = await createQueryBuilder()
      .select(['create_at AS x', 'temperature AS y'])
      .where(`master_id = :masterId`, { masterId })
      .andWhere(`slave_id = :slaveId`, { slaveId })
      .andWhere(`create_at BETWEEN :begin AND :end`, {
        begin: subDays(now, 7),
        end: now,
      })
      .distinct(true)
      .from(Temperature, 'temperatures')
      .orderBy('create_at', 'ASC')
      .getRawMany();

    return result;
  }

  async createTestData(masterId: number, slaveId: number) {
    const max = 25.5;
    const min = 23.0;
    const date: Date = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getHours(),
    );
    let now = date;
    let i = 0;
    console.log(`date: `, date);
    console.log(`now: `, now);
    try {
      for (; now >= subDays(date, 7); now = subMinutes(now, 10)) {
        console.log(`for now: `, now);

        const randomTemperature = Math.random() * (max - min) + min;
        const mockData = await this.create(
          new Temperature(
            masterId,
            slaveId,
            parseFloat(randomTemperature.toFixed(1)),
            now,
          ),
        );
        await this.save(mockData);
        console.log(`save count: `, ++i);
      }

      return `save count: ${i}`;
    } catch (e) {
      console.log(e);
    }
  }
}
