import { Test, TestingModule } from '@nestjs/testing';
import { CreateMasterDto } from '../../api/master/dto/create-master.dto';
import { getTypeOrmTestModule } from '../../config/database-test.service';
import { getConnection } from 'typeorm';
import { clearDB } from '../../util/test-helper';
import { DeviceSlaveService } from './device-slave.service';
import { DeviceSlaveModule } from './device-slave.module';
import { CreateSlaveDto } from '../../api/slave/dto/create-slave.dto';
import { DeviceMasterService } from '../master/device-master.service';

describe('DeviceTemperatureService', () => {
  const MASTER_ID = 101;
  const SLAVE_ID = 102;
  let masterService: DeviceMasterService;
  let slaveService: DeviceSlaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DeviceSlaveModule, getTypeOrmTestModule()],
    }).compile();
    masterService = module.get<DeviceMasterService>(DeviceMasterService);
    slaveService = module.get<DeviceSlaveService>(DeviceSlaveService);
  });

  afterEach(async () => {
    // await clearDB();
    await getConnection().close();
  });

  it('Slave를 생성하고 해당 슬레이브의 마스터 주소를 가져온다.', async () => {
    const createMasterDto = new CreateMasterDto(MASTER_ID, 'seoul');
    const createSlaveDto = new CreateSlaveDto(MASTER_ID, SLAVE_ID);
    const master = await masterService.createMaster(createMasterDto);
    expect(master.address).toEqual('seoul');

    const slave = await slaveService.createSlave(createSlaveDto);
    expect(slave.masterId).toEqual(101);

    const found = await slaveService.findSlave(MASTER_ID, SLAVE_ID);
    expect(found.master.address).toEqual('seoul');
  });

  it('Slave를 생성하고 삭제한다.', async () => {
    const createMasterDto = new CreateMasterDto(MASTER_ID, 'kangnam');
    const createSlaveDto = new CreateSlaveDto(MASTER_ID, SLAVE_ID);
    const master = await masterService.createMaster(createMasterDto);
    const slave = await slaveService.createSlave(createSlaveDto);

    expect(master.address).toEqual('kangnam');
    expect(slave.masterId).toEqual(101);

    const deleteResult = await slaveService.deleteSlave(MASTER_ID, SLAVE_ID);
    expect(deleteResult.affected).toEqual(1);
  });
});
