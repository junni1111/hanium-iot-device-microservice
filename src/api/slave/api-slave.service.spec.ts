import { Test, TestingModule } from '@nestjs/testing';
import { clearDB } from '../../util/test-helper';
import { getTypeOrmTestModule } from '../../config/database-test.service';
import { CreateMasterDto } from '../../api/dto/master/create-master.dto';
import { CreateSlaveDto } from '../../api/dto/slave/create-slave.dto';
import { getConnection } from 'typeorm';

import { DeviceSlaveModule } from '../../device/slave/device-slave.module';
import { DeviceMasterService } from '../../device/master/device-master.service';
import { DeviceSlaveService } from '../../device/slave/device-slave.service';
import { defaultSlaveConfig } from '../../device/interfaces/slave-configs';

describe('API Slave 서비스 테스트', () => {
  const MOCK_MASTER_ID = 1000;
  const MOCK_SLAVE_ID = 1001;
  let masterService: DeviceMasterService;
  let slaveService: DeviceSlaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DeviceSlaveModule, getTypeOrmTestModule()],
    }).compile();

    masterService = module.get<DeviceMasterService>(DeviceMasterService);
    slaveService = module.get<DeviceSlaveService>(DeviceSlaveService);
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
    await getConnection().close();
  });

  it('센서들의 기본 설정값을 설정한다.', async () => {
    const defaultConfigs = { ...defaultSlaveConfig };
    const fetchConfigs = await slaveService.getConfigs(
      MOCK_MASTER_ID,
      MOCK_SLAVE_ID,
    );
    expect(fetchConfigs.rangebegin).toEqual(defaultConfigs.rangeBegin);

    // const saved = await ledService.setConfig({
    //   masterId: MOCK_MASTER_ID,
    //   slaveId: MOCK_SLAVE_ID,
    //   ledRuntime: 11,
    //   ledCycle: 22,
    // });
    // expect(saved.ledCycle).toEqual(22);
    //
    // const found = await ledRepository.findBySlave(
    //   MOCK_MASTER_ID,
    //   MOCK_SLAVE_ID,
    // );
    // expect([found.ledRuntime, found.ledCycle]).toEqual([11, 22]);
    //
    // const updated = await ledService.setConfig({
    //   masterId: MOCK_MASTER_ID,
    //   slaveId: MOCK_SLAVE_ID,
    //   ledRuntime: 1111,
    //   ledCycle: 2222,
    // });
    // expect(updated.ledRuntime).toEqual(1111);
    //
    // const updateFound = await ledRepository.findBySlave(
    //   MOCK_MASTER_ID,
    //   MOCK_SLAVE_ID,
    // );
    // expect([updateFound.ledRuntime, updateFound.ledCycle]).toEqual([
    //   1111, 2222,
    // ]);
  });
});
