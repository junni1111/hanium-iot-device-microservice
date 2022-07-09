import { Test, TestingModule } from '@nestjs/testing';
import { clearDB } from '../../util/test-helper';
import { DeviceMasterService } from '../../device/master/device-master.service';
import { DeviceSlaveService } from '../../device/slave/device-slave.service';
import { getTypeOrmTestModule } from '../../config/database-test.service';
import { DeviceWaterPumpService } from './device-water-pump.service';
import { DeviceWaterPumpModule } from './device-water-pump.module';
import { CreateMasterDto } from '../../api/dto/master/create-master.dto';
import { CreateSlaveDto } from '../../api/dto/slave/create-slave.dto';
import { getConnection } from 'typeorm';
import { WaterPumpConfig } from '../entities/water-pump.entity';
import { WaterPumpRepository } from '../repositories/water-pump.repository';

describe('물 펌프 서비스 테스트', () => {
  const MOCK_MASTER_ID = 1000;
  const MOCK_SLAVE_ID = 1001;
  let masterService: DeviceMasterService;
  let slaveService: DeviceSlaveService;
  let waterPumpService: DeviceWaterPumpService;
  let waterPumpRepository: WaterPumpRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DeviceWaterPumpModule, getTypeOrmTestModule()],
    }).compile();

    masterService = module.get<DeviceMasterService>(DeviceMasterService);
    slaveService = module.get<DeviceSlaveService>(DeviceSlaveService);
    waterPumpService = module.get<DeviceWaterPumpService>(
      DeviceWaterPumpService,
    );
    waterPumpRepository = module.get<WaterPumpRepository>(WaterPumpRepository);
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

  it('물 펌프 설정값을 설정한다.', async () => {
    const saved = await waterPumpService.setConfigs({
      masterId: MOCK_MASTER_ID,
      slaveId: MOCK_SLAVE_ID,
      waterPumpCycle: 11,
      waterPumpRuntime: 22,
    });
    expect(saved.waterPumpCycle).toEqual(11);

    const found = await waterPumpRepository.findBySlave(
      MOCK_MASTER_ID,
      MOCK_SLAVE_ID,
    );
    expect([found.waterPumpCycle, found.waterPumpRuntime]).toEqual([11, 22]);

    const updated = await waterPumpService.setConfigs({
      masterId: MOCK_MASTER_ID,
      slaveId: MOCK_SLAVE_ID,
      waterPumpCycle: 1111,
      waterPumpRuntime: 2222,
    });
    expect(updated.waterPumpRuntime).toEqual(2222);

    const updateFound = await waterPumpRepository.findBySlave(
      MOCK_MASTER_ID,
      MOCK_SLAVE_ID,
    );
    expect([updateFound.waterPumpCycle, updateFound.waterPumpRuntime]).toEqual([
      1111, 2222,
    ]);
  });
});
