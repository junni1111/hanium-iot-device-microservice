import { Test, TestingModule } from '@nestjs/testing';
import { ThermometerRepository } from '../repositories/thermometer.repository';
import { TemperatureRepository } from './device-temperature.repository';
import { clearDB } from '../../util/test-helper';
import { getConnection } from 'typeorm';
import { getTypeOrmTestModule } from '../../config/database-test.service';
import { DeviceTemperatureModule } from './device-temperature.module';
import { ThermometerConfig } from './entities/thermometer.entity';
import { DeviceSlaveService } from '../slave/device-slave.service';
import { DeviceSlaveModule } from '../slave/device-slave.module';
import { CreateSlaveDto } from '../../api/slave/dto/create-slave.dto';
import { DeviceMasterModule } from '../master/device-master.module';
import { DeviceMasterService } from '../master/device-master.service';
import { CreateMasterDto } from '../../api/master/dto/create-master.dto';
import { MasterRepository } from '../master/master.repository';
import { Master } from '../master/entities/master.entity';
import { ITemperatureConfig } from '../interfaces/slave-configs';

describe('DeviceThermometerService', () => {
  const MASTER_ID = 10011;
  const SLAVE_ID = 10022;
  // let service: DeviceTemperatureService;
  let thermometerRepository: ThermometerRepository;
  let masterService: DeviceMasterService;
  let slaveService: DeviceSlaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DeviceTemperatureModule, getTypeOrmTestModule()],
    }).compile();

    // service = module.get<DeviceTemperatureService>(DeviceTemperatureService);
    thermometerRepository = module.get<ThermometerRepository>(
      ThermometerRepository,
    );

    // temperatureRepository = module.get<TemperatureRepository>(
    //   TemperatureRepository,
    // );
    //
    // masterRepository = module.get<MasterRepository>(MasterRepository);

    masterService = module.get<DeviceMasterService>(DeviceMasterService);
    slaveService = module.get<DeviceSlaveService>(DeviceSlaveService);
  });

  beforeEach(async () => {
    await masterService.createMaster(new CreateMasterDto(MASTER_ID, 'default'));
    await slaveService.createSlave(new CreateSlaveDto(MASTER_ID, SLAVE_ID));
  });

  afterEach(async () => {
    await clearDB();
    await getConnection().close();
  });

  it('db에 온도 센서를 생성하고 조회한다.', async () => {
    const mockConfigs: ITemperatureConfig = {
      rangeBegin: 11,
      rangeEnd: 22,
      updateCycle: 33,
    };
    const result = await thermometerRepository.setConfigs(
      MASTER_ID,
      SLAVE_ID,
      mockConfigs,
    );
    expect(result.updateCycle).toEqual(33);

    const found = await thermometerRepository.findBySlave(MASTER_ID, SLAVE_ID);
    expect(found.rangeBegin).toEqual(11);
  });

  // it('db에 온도를 저장한다', async () => {});

  // it('현재 온도를 저장, 캐싱하고 일 평균 온도를 캐싱한다', async () => {
  //   // const temperature = new Temperature(MASTER_ID, SLAVE_ID, 22.2);
  //
  //   const [insertResult, cachedResult, cachedAverageResult] =
  //     await service.saveTemperature(MASTER_ID, SLAVE_ID, 11, new Date());
  //
  //   expect(insertResult['value']['identifiers'][0]['masterId']).toEqual(101);
  //   expect(cachedResult['value']).toEqual('OK');
  //   expect(cachedAverageResult['value']).toEqual('OK');
  // });
  //
  // it('DB에서 온도 평균을 가져온다', async () => {
  //   const begin = subDays(new Date(), 6);
  //   const end = new Date();
  //   const average = await service.getAverage(MASTER_ID, SLAVE_ID, begin, end);
  //
  //   expect(average).toBeDefined();
  // });
  //
  // it('1주일 평균 온도의 점들을 가져온다', async () => {
  //   const begin = subDays(new Date(), 6);
  //   const end = new Date();
  //   const points = await service.getAveragePoints(
  //     1,
  //     17,
  //     begin,
  //     end,
  //     addDays,
  //     1,
  //   );
  //
  //   expect(points.length).toEqual(7);
  // });
});
