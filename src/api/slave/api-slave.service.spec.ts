import { Test, TestingModule } from '@nestjs/testing';
import { clearDB } from '../../util/test-helper';
import { CreateMasterDto } from '../master/dto/create-master.dto';
import { CreateSlaveDto } from './dto/create-slave.dto';
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

    expect(fetchConfigs.rangeBegin).toEqual(defaultConfigs.rangeBegin);
  });
});
