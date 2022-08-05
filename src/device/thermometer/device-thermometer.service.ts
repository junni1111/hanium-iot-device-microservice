import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { TemperatureRepository } from '../repositories/device-temperature.repository';
import { ThermometerRepository } from '../repositories/thermometer.repository';

@Injectable()
export class DeviceThermometerService {
  constructor(
    private readonly thermometerRepository: ThermometerRepository,
    private readonly temperatureRepository: TemperatureRepository,
  ) {}

  /** Todo: Custom Repository 제거하고
   *        이 함수에 온도 저장 로직 설정 */
  // insertTemperature(temperature: Temperature) {
  //   return this.temperatureRepository
  //     .createQueryBuilder()
  //     .insert()
  //     .into(Temperature)
  //     .values(temperature)
  //     .execute();
  // }

  // insertTemperatureLog(masterId, slaveId, temperature) {
  //   // const sensor = Temperature.createSensor(masterId, slaveId);
  //   const sensor = this.temperatureRepository.create(
  //     Thermometer.createSensor(masterId, slaveId),
  //   );
  //
  //   console.log(`Sensor ID: `, sensor);
  //
  //   const log = this.temperatureLogRepository.create({
  //     sensor,
  //     temperature,
  //   });
  //
  //   console.log(`insert result: `, log);
  //   return this.temperatureLogRepository
  //     .createQueryBuilder()
  //     .insert()
  //     .into(TemperatureLog)
  //     .values(log)
  //     .execute();
  // }
  //
  // getAverage(masterId: number, slaveId: number, begin: Date, end: Date) {
  //   return this.temperatureRepository
  //     .createQueryBuilder('temperatures')
  //     .select('AVG(temperatures.temperature)', 'average')
  //     .where(`master_id = :masterId`, { masterId })
  //     .andWhere(`slave_id = :slaveId`, { slaveId })
  //     .andWhere(`create_at BETWEEN :begin AND :end`, {
  //       begin,
  //       end,
  //     })
  //     .getRawOne();
  // }
  //
  // saveTemperature(masterId: number, slaveId: number, temperature, date: Date) {
  //   try {
  //     return Promise.allSettled([
  //       this.insertTemperatureLog(masterId, slaveId, temperature),
  //       this.cacheTemperature(masterId, slaveId, temperature),
  //       this.cacheDayAverage(masterId, slaveId, temperature, date),
  //     ]);
  //   } catch (e) {
  //     throw e;
  //   }
  // }
  //
  // // async saveTemperature(temperature: Temperature, date: Date) {
  // //   try {
  // //     return Promise.allSettled([
  // //       this.insertTemperature(temperature),
  // //       this.cacheTemperature(temperature),
  // //       this.cacheDayAverage(temperature, date),
  // //     ]);
  // //   } catch (e) {
  // //     throw e;
  // //   }
  // // }
  //
  // // private async cacheDayAverage(
  // //   { masterId, slaveId, temperature }: Temperature,
  // //   date: Date,
  // // ) {
  // //   const dayAverageKey = GenerateDayAverageKey(masterId, slaveId, date);
  // //   const averageInfo = await this.cacheManager.get<number[]>(dayAverageKey);
  // //
  // //   if (!averageInfo) {
  // //     return this.cacheManager.set(
  // //       dayAverageKey,
  // //
  // //       [temperature, 1],
  // //       { ttl: 604800 }, // 1주일 -> 초
  // //     );
  // //   }
  // //
  // //   const [prevAverage, averageCount] = averageInfo;
  // //   const average = this.updateAverage(temperature, prevAverage, averageCount);
  // //
  // //   return this.cacheManager.set(
  // //     dayAverageKey,
  // //     [average, averageCount + 1],
  // //     { ttl: 604800 }, // 1주일 -> 초
  // //   );
  // // }
  //
  // private async cacheDayAverage(
  //   masterId: number,
  //   slaveId: number,
  //   temperature: number,
  //   date: Date,
  // ) {
  //   const dayAverageKey = GenerateDayAverageKey(masterId, slaveId, date);
  //   const averageInfo = await this.cacheManager.get<number[]>(dayAverageKey);
  //
  //   if (!averageInfo) {
  //     return this.cacheManager.set(
  //       dayAverageKey,
  //
  //       [temperature, 1],
  //       { ttl: 604800 }, // 1주일 -> 초
  //     );
  //   }
  //
  //   const [prevAverage, averageCount] = averageInfo;
  //   const average = this.updateAverage(temperature, prevAverage, averageCount);
  //
  //   console.log(`average: `, average);
  //   return this.cacheManager.set(
  //     dayAverageKey,
  //     [average, averageCount + 1],
  //     { ttl: 604800 }, // 1주일 -> 초
  //   );
  // }
  //
  // getCachedTemperature(masterId: number, slaveId: number): Promise<number> {
  //   try {
  //     const key = SensorStateKey({
  //       sensor: ESlaveState.TEMPERATURE,
  //       masterId,
  //       slaveId,
  //     });
  //
  //     return this.cacheManager.get<number>(key);
  //   } catch (e) {
  //     throw e;
  //   }
  // }
  //
  // getTemperaturesBetweenDates(
  //   masterId: number,
  //   slaveId: number,
  //   beginDate: Date,
  //   endDate: Date,
  // ) {
  //   return createQueryBuilder()
  //     .select(['create_at AS x', 'temperature AS y'])
  //     .where(`master_id = :masterId`, { masterId })
  //     .andWhere(`slave_id = :slaveId`, { slaveId })
  //     .andWhere(`create_at BETWEEN :begin AND :end`, {
  //       begin: beginDate,
  //       end: endDate,
  //     })
  //     .distinct(true)
  //     .from(Thermometer, 'temperatures')
  //     .limit(100000) // Todo: 제한 고민
  //     .orderBy('create_at', 'ASC')
  //     .getRawMany();
  // }
  //
  // async setTemperatureConfig({
  //   masterId,
  //   slaveId,
  //   startTemperatureRange,
  //   endTemperatureRange,
  //   temperatureUpdateCycle,
  // }: Partial<SlaveConfigDto>) {
  //   try {
  //     const config: ITemperatureConfig = {
  //       startTemperatureRange,
  //       endTemperatureRange,
  //       temperatureUpdateCycle,
  //     };
  //     return this.slaveRepository.setConfig(masterId, slaveId, config);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
  // //
  // // async createTestData(masterId: number, slaveId: number) {
  // //   return this.temperatureRepository.createTestData(masterId, slaveId);
  // // }
  //
  // async cacheTemperature(masterId: number, slaveId: number, temperature) {
  //   const key = SensorStateKey({
  //     sensor: ESlaveState.TEMPERATURE,
  //     masterId,
  //     slaveId,
  //   });
  //
  //   const cachedResult = await this.cacheManager.set<number>(key, temperature, {
  //     ttl: 60,
  //   });
  //   console.log(`cached Result: `, cachedResult);
  //   return cachedResult;
  // }
  //
  // // async cacheTemperature({ masterId, slaveId, temperature }: Temperature) {
  // //   const key = SensorStateKey({
  // //     sensor: ESlaveState.TEMPERATURE,
  // //     masterId,
  // //     slaveId,
  // //   });
  // //   return this.cacheManager.set<number>(key, temperature, { ttl: 60 });
  // // }
  //
  // async getTemperatureRange(
  //   masterId: number,
  //   slaveId: number,
  // ): Promise<number[]> {
  //   const key = SensorConfigKey({
  //     sensor: ESlaveConfigTopic.TEMPERATURE,
  //     masterId,
  //     slaveId,
  //   });
  //
  //   const cachedRange = await this.cacheManager.get<number[]>(key);
  //   if (cachedRange) {
  //     return cachedRange;
  //   }
  //
  //   const configs = await this.slaveRepository.getConfigs(masterId, slaveId);
  //   /** Todo: Exception handling */
  //   const range = [
  //     configs?.startTemperatureRange,
  //     configs?.endTemperatureRange,
  //   ];
  //
  //   await this.cacheManager.set<number[]>(key, range, { ttl: 3600 });
  //   return range;
  // }
  //
  // async getAveragePoints(
  //   masterId: number,
  //   slaveId: number,
  //   beginDate: Date,
  //   endDate: Date,
  //   addFunction: (date: Date | number, amount: number) => Date,
  //   timeAmount: number,
  // ) {
  //   const keys = GenerateAverageKeys(
  //     masterId,
  //     slaveId,
  //     beginDate,
  //     endDate,
  //     addFunction,
  //     timeAmount,
  //   );
  //   const [min, max] = await this.getTemperatureRange(masterId, slaveId);
  //   const points: GraphPoint[] = [];
  //
  //   await Promise.all(
  //     keys.map(async (key: string) => {
  //       const cached = await this.cacheManager.get<number[]>(key);
  //       const [, , , , year, month, day] = key.split('/');
  //       const dateString = `${year}/${month}/${day}`;
  //
  //       if (!cached) {
  //         const begin = new Date(dateString);
  //         const end = addFunction(begin, timeAmount);
  //         const { average } = await this.getAverage(
  //           masterId,
  //           slaveId,
  //           begin,
  //           end,
  //         );
  //
  //         if (!average) {
  //           return;
  //         }
  //
  //         await this.cacheManager.set<number[]>(key, [average, 1], {
  //           ttl: 604800, // 1주일 -> 초
  //         });
  //         return points.push(new GraphPoint(dateString, average, min, max));
  //       }
  //
  //       const [cachedAverage] = cached;
  //       return points.push(new GraphPoint(dateString, cachedAverage, min, max));
  //     }),
  //   );
  //
  //   // 월 화 수 목 금 토 일
  //   return points.sort((a, b): number => (a.x < b.x ? -1 : 1));
  // }
  //
  // private updateAverage(
  //   temperature: number,
  //   prevAverage: number,
  //   averageCount: number,
  // ) {
  //   return (
  //     prevAverage * (averageCount / (averageCount + 1)) +
  //     temperature / (averageCount + 1)
  //   );
  // }
}
