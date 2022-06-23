import { Test, TestingModule } from '@nestjs/testing';
import { ApiModule } from '../api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseService } from '../../config/database.service';
import { DeviceTemperatureService } from '../../device/thermometer/device-temperature.service';
import { addDays } from 'date-fns';
import { Temperature } from '../../device/entities/temperature.entity';
import { TemperatureRepository } from '../../device/repositories/temperature.repository';

describe('온도 api 서비스 테스트', () => {
  const MOCK_MASTER_ID = 100;
  const MOCK_SLAVE_ID = 100;
  let deviceTemperatureService: DeviceTemperatureService;
  let temperatureRepo: TemperatureRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ApiModule,
        TypeOrmModule.forRoot(databaseService.getTypeOrmConfig()),
      ],
    }).compile();

    temperatureRepo = module.get<TemperatureRepository>(TemperatureRepository);
    deviceTemperatureService = module.get<DeviceTemperatureService>(
      DeviceTemperatureService,
    );
  });

  afterEach(async () => {
    /** Todo: Change to test DB!!! */
    await temperatureRepo
      .createQueryBuilder()
      .delete()
      .from(Temperature)
      .where(`masterId = :masterId`, { masterId: MOCK_MASTER_ID })
      .andWhere(`slaveId = :slaveId`, { slaveId: MOCK_SLAVE_ID })
      .execute();
  });

  it('온도를 저장하고, 삭제한다', async () => {
    const temperature = new Temperature(MOCK_MASTER_ID, MOCK_SLAVE_ID, 22);
    const saveResult = await deviceTemperatureService.insertTemperature(
      temperature,
    );
    expect(saveResult.raw.length).toEqual(1);

    const deleteResult = await temperatureRepo
      .createQueryBuilder()
      .delete()
      .from(Temperature)
      .where(`masterId = :masterId`, { masterId: MOCK_MASTER_ID })
      .andWhere(`slaveId = :slaveId`, { slaveId: MOCK_SLAVE_ID })
      .execute();
    expect(deleteResult.affected).toEqual(1);
  });

  it('기간 내의 저장된 온도들을 반환한다 ', async () => {
    const temperature = new Temperature(MOCK_MASTER_ID, MOCK_SLAVE_ID, 22);
    const saveResult = await deviceTemperatureService.insertTemperature(
      temperature,
    );
    expect(saveResult.raw.length).toEqual(1);

    const beginDate = new Date(new Date().toDateString());
    const endDate = addDays(beginDate, 1);
    const temperatures =
      await deviceTemperatureService.getTemperaturesBetweenDates(
        MOCK_MASTER_ID,
        MOCK_SLAVE_ID,
        beginDate,
        endDate,
      );
    console.log(temperatures);
    expect(temperatures[0]['y']).toEqual(22);

    const futureBegin = addDays(beginDate, 7);
    const futureEnd = addDays(futureBegin, 1);
    const emptyTemperatures =
      await deviceTemperatureService.getTemperaturesBetweenDates(
        MOCK_MASTER_ID,
        MOCK_SLAVE_ID,
        futureBegin,
        futureEnd,
      );
    expect(emptyTemperatures.length).toEqual(0);
  });
});
