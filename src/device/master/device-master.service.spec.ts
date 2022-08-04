import { Test, TestingModule } from '@nestjs/testing';
import { DeviceMasterService } from './device-master.service';
import { CreateMasterDto } from '../../api/master/dto/create-master.dto';
import { DeviceMasterModule } from './device-master.module';
import { getTypeOrmTestModule } from '../../config/database-test.service';
import { getConnection } from 'typeorm';
import { clearDB } from '../../util/test-helper';

describe('DeviceTemperatureService', () => {
  const MASTER_ID = 101;
  let service: DeviceMasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DeviceMasterModule, getTypeOrmTestModule()],
    }).compile();

    service = module.get<DeviceMasterService>(DeviceMasterService);
  });

  afterEach(async () => {
    await clearDB();
    await getConnection().close();
  });

  it('Master를 생성한다.', async () => {
    const dto = new CreateMasterDto(MASTER_ID, 'kangnam');
    const master = await service.createMaster(dto);
    expect(master.address).toEqual('kangnam');
  });

  it('Master를 생성하고 삭제한다.', async () => {
    const dto = new CreateMasterDto(MASTER_ID, 'seoul');
    const master = await service.createMaster(dto);
    expect(master.address).toEqual('seoul');

    const deleteResult = await service.deleteMaster(MASTER_ID);
    expect(deleteResult.affected).toEqual(1);
  });
});
