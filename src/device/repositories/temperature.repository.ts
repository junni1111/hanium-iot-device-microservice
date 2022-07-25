// import { EntityRepository, Repository } from 'typeorm';
// import { Temperature } from '../entities/temperature.entity';
// import { subDays, subMinutes, subSeconds } from 'date-fns';
// import { TemperatureBetweenDto } from '../../api/dto/temperature/temperature-between.dto';
//
// @EntityRepository(Temperature)
// export class TemperatureRepository extends Repository<Temperature> {
//   async createTestData(temperatureBetweenDto: TemperatureBetweenDto) {
//     const { masterId, slaveId, begin, end } = temperatureBetweenDto;
//     const max = 25.5;
//     const min = 23.0;
//     let i = 0;
//     let randSecond = 10;
//     const beginDate = new Date(begin);
//     let endDate = new Date(end);
//
//     try {
//       for (; endDate >= beginDate; endDate = subSeconds(endDate, 60)) {
//         console.log(`endDate: `, endDate);
//
//         const randomTemperature = Math.random() * (max - min) + min;
//         const mockData = await this.create(
//           new Temperature(
//             masterId,
//             slaveId,
//             parseFloat(randomTemperature.toFixed(1)),
//             endDate,
//           ),
//         );
//         await this.save(mockData);
//         console.log(`save count: `, ++i);
//         randSecond = Math.random() * 10 + 10;
//       }
//
//       return `save count: ${i}`;
//     } catch (e) {
//       console.log(e);
//     }
//   }
// }
