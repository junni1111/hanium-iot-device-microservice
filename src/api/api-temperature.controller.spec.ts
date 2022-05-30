import { Test, TestingModule } from '@nestjs/testing';
import { ApiSlaveController } from './api-slave.controller';
import { ApiModule } from './api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseService } from '../config/database.service';
import { SlaveConfigDto } from './dto/slave/slave-config.dto';
import { DeviceTemperatureService } from '../device/device-temperature.service';
import { Master } from '../device/entities/master.entity';
import { DeviceMasterService } from '../device/device-master.service';
import { CreateMasterDto } from './dto/master/create-master.dto';
import { CreateSlaveDto } from './dto/slave/create-slave.dto';
import { RedisController } from '../cache/redis.controller';
import { RedisModule } from '../cache/redis.module';
import { CacheModule } from '@nestjs/common';
import * as redisStore from 'cache-manager-ioredis';
import { REDIS_HOST, REDIS_PORT } from '../config/redis.config';

describe('온도 api 컨트롤러 테스트', () => {
  const MOCK_MASTER_ID = 100;
  const MOCK_SLAVE_ID = 100;
  let deviceTemperatureService: DeviceTemperatureService;
  let controller: ApiSlaveController;
  let deviceMasterService: DeviceMasterService;
  let redisController: RedisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ApiModule,
        RedisModule,
        TypeOrmModule.forRoot(databaseService.getTypeOrmConfig()),
      ],
    }).compile();

    controller = module.get<ApiSlaveController>(ApiSlaveController);
    redisController = module.get<RedisController>(RedisController);

    deviceTemperatureService = module.get<DeviceTemperatureService>(
      DeviceTemperatureService,
    );
    deviceMasterService = module.get<DeviceMasterService>(DeviceMasterService);
  });

  beforeEach(async () => {
    await deviceMasterService.createMaster(
      new CreateMasterDto(MOCK_MASTER_ID, `mock`),
    );

    await deviceMasterService.createSlave(
      new CreateSlaveDto(MOCK_MASTER_ID, MOCK_SLAVE_ID),
    );
  });

  afterEach(async () => {
    await deviceMasterService.deleteSlave(MOCK_MASTER_ID, MOCK_SLAVE_ID);
    await deviceMasterService.deleteMaster(MOCK_MASTER_ID);
  });

  it('온도 범위 설정 테스트', async () => {
    const setMockDto = (dto: Partial<SlaveConfigDto>) => {
      const mockDto: Partial<SlaveConfigDto> = dto;
      mockDto.masterId = MOCK_MASTER_ID;
      mockDto.slaveId = MOCK_SLAVE_ID;
      mockDto.startTemperatureRange = 10;
      mockDto.endTemperatureRange = 20;
      mockDto.temperatureUpdateCycle = 100;
      return mockDto;
    };

    const dto = setMockDto(new SlaveConfigDto());

    const temperatureConfigResult =
      await deviceTemperatureService.setTemperatureConfig(dto);

    console.log(temperatureConfigResult);
    expect(temperatureConfigResult.affected > 0).toEqual(true);

    const temperatureRangeKey = `test/temperature/key`;
    await redisController.setTestTemperatureRange(temperatureRangeKey, [
      dto.startTemperatureRange,
      dto.endTemperatureRange,
    ]);

    const cachedValue = await redisController.getTestTemperatureRange(
      temperatureRangeKey,
    );

    expect(cachedValue).toStrictEqual([10, 20]);
  });
});
