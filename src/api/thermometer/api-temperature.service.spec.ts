import { Test, TestingModule } from '@nestjs/testing';
import { DeviceTemperatureService } from '../../device/thermometer/device-temperature.service';
import { addMinutes } from 'date-fns';
import { clearDB } from '../../util/test-helper';
import { DeviceTemperatureModule } from '../../device/thermometer/device-temperature.module';
import { DeviceMasterService } from '../../device/master/device-master.service';
import { DeviceSlaveService } from '../../device/slave/device-slave.service';
import { CreateMasterDto } from '../master/dto/create-master.dto';
import { CreateSlaveDto } from '../slave/dto/create-slave.dto';
import { getTypeOrmTestModule } from '../../config/database-test.service';

describe('온도 api 서비스 테스트', () => {
  const MOCK_MASTER_ID = 100;
  const MOCK_SLAVE_ID = 100;
  let masterService: DeviceMasterService;
  let slaveService: DeviceSlaveService;
  let temperatureService: DeviceTemperatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DeviceTemperatureModule, getTypeOrmTestModule()],
    }).compile();

    masterService = module.get<DeviceMasterService>(DeviceMasterService);
    slaveService = module.get<DeviceSlaveService>(DeviceSlaveService);
    temperatureService = module.get<DeviceTemperatureService>(
      DeviceTemperatureService,
    );
  });

  beforeEach(async () => {
    await masterService.createMaster(
      new CreateMasterDto(MOCK_MASTER_ID, 'Default Address'),
    );
    await slaveService.createSlave(
      new CreateSlaveDto(MOCK_MASTER_ID, MOCK_SLAVE_ID),
    );
  });

  afterEach(async () => {
    await clearDB();
  });

  it('팬이 작동할 온도 범위를 설정한다.', async () => {
    const saved = await temperatureService.setConfig({
      masterId: MOCK_MASTER_ID,
      slaveId: MOCK_SLAVE_ID,
      rangeBegin: 11,
      rangeEnd: 22,
      updateCycle: 33,
    });
    expect(saved.rangeBegin).toEqual(11);

    const updated = await temperatureService.setConfig({
      masterId: MOCK_MASTER_ID,
      slaveId: MOCK_SLAVE_ID,
      rangeBegin: 1111,
      rangeEnd: 2222,
      updateCycle: 33333,
    });
    expect(updated.rangeBegin).toEqual(1111);
  });

  it('기간 내의 저장된 온도들을 반환한다 ', async () => {
    const baseDate = new Date('2022-07-07');
    const endDate = new Date('2022-07-09');

    let i = 0;
    for (
      let beginDate = baseDate;
      beginDate < endDate;
      beginDate = addMinutes(beginDate, 30)
    ) {
      await temperatureService.insertTemperature(
        MOCK_MASTER_ID,
        MOCK_SLAVE_ID,
        ++i,
        beginDate,
      );
    }
    const temperatures = await temperatureService.getTemperaturesBetweenDates(
      MOCK_MASTER_ID,
      MOCK_SLAVE_ID,
      baseDate,
      endDate,
    );
    expect(temperatures.length).toEqual(96);

    const { average } = await temperatureService.getAverage(
      MOCK_MASTER_ID,
      MOCK_SLAVE_ID,
      baseDate,
      endDate,
    );
    expect(average).toBeLessThan(1000);
  });
});
