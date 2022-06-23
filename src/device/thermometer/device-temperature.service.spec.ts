import { Test, TestingModule } from '@nestjs/testing';
import { DeviceTemperatureService } from './device-temperature.service';
import { ApiModule } from '../../api/api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseService } from '../../config/database.service';
import { Temperature } from '../entities/temperature.entity';
import { TemperatureRepository } from '../repositories/temperature.repository';

describe('DeviceTemperatureService', () => {
  const MASTER_ID = 101;
  const SLAVE_ID = 101;
  let service: DeviceTemperatureService;
  let repository: TemperatureRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ApiModule,
        TypeOrmModule.forRoot(databaseService.getTypeOrmConfig()),
      ],
    }).compile();

    service = module.get<DeviceTemperatureService>(DeviceTemperatureService);
    repository = module.get<TemperatureRepository>(TemperatureRepository);
  });

  afterEach(async () => {
    /** Todo: Change to test DB!!! */
    await repository
      .createQueryBuilder()
      .delete()
      .from(Temperature)
      .where(`masterId = :masterId`, { masterId: MASTER_ID })
      .andWhere(`slaveId = :slaveId`, { slaveId: SLAVE_ID })
      .execute();
  });

  it('현재 온도를 저장, 캐싱하고 일 평균 온도를 캐싱한다', async () => {
    const temperature = new Temperature(MASTER_ID, SLAVE_ID, 22.2);
    const [insertResult, cachedResult, cachedAverageResult] =
      await service.saveTemperature(temperature, new Date());

    expect(insertResult['value']['identifiers'][0]['masterId']).toEqual(101);
    expect(cachedResult['value']).toEqual('OK');
    expect(cachedAverageResult['value']).toEqual('OK');
  });
});
