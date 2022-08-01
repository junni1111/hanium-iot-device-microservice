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
import { CreateSlaveDto } from '../../api/dto/slave/create-slave.dto';
import { DeviceMasterModule } from '../master/device-master.module';
import { DeviceMasterService } from '../master/device-master.service';
import { CreateMasterDto } from '../../api/dto/master/create-master.dto';
import { MasterRepository } from '../repositories/master.repository';
import { Master } from '../master/entities/master.entity';

describe('DeviceTemperatureService', () => {
  const MASTER_ID = 1001;
  const SLAVE_ID = 1002;
  // let service: DeviceTemperatureService;
  let thermometerRepository: ThermometerRepository;
  let temperatureRepository: TemperatureRepository;
  let masterService: DeviceMasterService;
  let slaveService: DeviceSlaveService;
  let masterRepository: MasterRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DeviceMasterModule,
        DeviceSlaveModule,
        DeviceTemperatureModule,
        getTypeOrmTestModule(),
      ],
    }).compile();

    // service = module.get<DeviceTemperatureService>(DeviceTemperatureService);
    thermometerRepository = module.get<ThermometerRepository>(
      ThermometerRepository,
    );

    temperatureRepository = module.get<TemperatureRepository>(
      TemperatureRepository,
    );

    masterRepository = module.get<MasterRepository>(MasterRepository);

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

  it('db에 온도 센서를 생성하고, 현재 온도를 저장한다', async () => {
    const result = await temperatureRepository.createLog(
      MASTER_ID,
      SLAVE_ID,
      123,
    );
    expect(result.raw.length).toEqual(1);

    console.log(result);

    const found = await temperatureRepository.findBySlave(MASTER_ID, SLAVE_ID);
    console.log(found);
    expect(found[0].y).toEqual(123);

    // const sensorSaved = await thermometerRepository.save(sensor);
    // const sensorFound = await thermometerRepository.find();
    // console.log(`found: `, sensorFound);
    // expect(sensorFound).toStrictEqual(33);
    //
    // const temperature = temperatureRepository.create({
    //   sensorId: 3,
    //   temperature: 55.5,
    // });
    // const temperatureSaved = await temperatureRepository.save(temperature);
    // const temperatureFound = await temperatureRepository.findSlaveInfo(1, 11);
    //
    // //     await temperatureRepository.findOne({
    // //   where: { sensorId: 3 },
    // // });
    // console.log(`tempr:`, temperature);
    // console.log(`found: `, temperatureFound);
    // expect(temperatureFound).toEqual('sadasd');
    // // expect(temperatureFound.temperature).toEqual(55.5);
    // expect(temperatureFound.sensor).toEqual(333);
    // const found = await temperatureRepository.findOne({
    //   where: { sensorId: 1 },
    // });
    // console.log(`found: `, found);
    // expect(found.temperature).toEqual(231);
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
