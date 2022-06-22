import { Test, TestingModule } from '@nestjs/testing';
import { RedisController } from './redis.controller';
import { RedisModule } from './redis.module';
import { GenerateTemperatureKeys } from '../util/key-generator';
import { addMinutes } from 'date-fns';
describe('Redis 컨트롤러 테스트', () => {
  let controller: RedisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule],
    }).compile();

    controller = module.get<RedisController>(RedisController);
  });

  it('로컬 redis key: test, value: 10을 저장하고 그 값을 가져온다', async () => {
    const TEST_KEY = 'test';
    const TEST_VALUE = 10;
    await controller.setTestCache(TEST_KEY, TEST_VALUE);
    const cachedValue = await controller.getTestCache(TEST_KEY);
    console.log(`(Key: ${TEST_KEY}, Value: ${cachedValue})`);
    expect(cachedValue).toEqual(10);
  });

  it('날짜 범위와 시간 간격으로 redis 키들을 만든다', () => {
    const expectFiveKeys = GenerateTemperatureKeys(
      100,
      100,
      new Date(),
      addMinutes(new Date(), 150),
      30,
    );

    expect(expectFiveKeys.length).toEqual(5);
  });
});
