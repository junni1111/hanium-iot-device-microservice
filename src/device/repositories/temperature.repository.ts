// import { EntityRepository, Repository } from 'typeorm';
// import { Temperature } from '../entities/temperature.entity';
// import { subDays, subMinutes } from 'date-fns';
//
// @EntityRepository(Temperature)
// export class TemperatureRepository extends Repository<Temperature> {
//   async createTestData(masterId: number, slaveId: number) {
//     const max = 25.5;
//     const min = 23.0;
//     const baseDate: Date = new Date();
//     let now = baseDate;
//     let i = 0;
//
//     try {
//       for (; now >= subDays(baseDate, 10); now = subMinutes(now, 1)) {
//         console.log(`now: `, now);
//
//         const randomTemperature = Math.random() * (max - min) + min;
//         const mockData = await this.create(
//           new Temperature(
//             masterId,
//             slaveId,
//             parseFloat(randomTemperature.toFixed(1)),
//             now,
//           ),
//         );
//         await this.save(mockData);
//         console.log(`save count: `, ++i);
//       }
//
//       return `save count: ${i}`;
//     } catch (e) {
//       console.log(e);
//     }
//   }
// }
