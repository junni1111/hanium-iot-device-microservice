import { Test, TestingModule } from '@nestjs/testing';
import { ApiSlaveController } from './api-slave.controller';
import { ApiModule } from '../api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseService } from '../../config/database.service';
import { SlaveConfigDto } from '../dto/slave/slave-config.dto';
import { DeviceTemperatureService } from '../../device/thermometer/device-temperature.service';
import { DeviceMasterService } from '../../device/master/device-master.service';
import { CreateMasterDto } from '../dto/master/create-master.dto';
import { CreateSlaveDto } from '../dto/slave/create-slave.dto';
import { RedisController } from '../../cache/redis.controller';
import { RedisModule } from '../../cache/redis.module';
import { ApiSlaveService } from './api-slave.service';
import { SlaveStateDto } from '../dto/slave/slave-state.dto';
import { SensorStateDto } from '../dto/slave/sensor-state.dto';

describe('slave api 컨트롤러 테스트', () => {
  let slaveController: ApiSlaveController;
  let apiSlaveService: ApiSlaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ApiModule,
        RedisModule,
        TypeOrmModule.forRoot(databaseService.getTypeOrmConfig()),
      ],
    }).compile();

    slaveController = module.get<ApiSlaveController>(ApiSlaveController);
    apiSlaveService = module.get<ApiSlaveService>(ApiSlaveService);
  });

  it('캐싱된 센서 상태를 가져온다', async () => {
    const MOCK_MASTER_ID = 100;
    const MOCK_SLAVE_ID = 100;
    const willEmptyResult = await apiSlaveService.getSensorsState(
      new SlaveStateDto(MOCK_MASTER_ID, MOCK_SLAVE_ID),
    );
    const emptyResult: SensorStateDto = {
      waterPumpPowerState: null,
      waterPumpRunningState: null,
      ledPowerState: null,
      ledRunningState: null,
      fanPowerState: null,
      fanRunningState: null,
    };
    expect(willEmptyResult).toStrictEqual(emptyResult);
  });
});
