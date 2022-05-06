import { Test, TestingModule } from '@nestjs/testing';
import { CacheController } from './cache.controller';
import { CacheModule } from '@nestjs/common';
import * as redisStore from 'cache-manager-ioredis';
import { REDIS_HOST, REDIS_PORT } from '../config/redis.config';

describe('Redis 컨트롤러 테스트', () => {
  let controller: CacheController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          store: redisStore,
          host: REDIS_HOST,
          port: REDIS_PORT,
        }),
      ],
      controllers: [CacheController],
    }).compile();

    controller = module.get<CacheController>(CacheController);
  });

  it('로컬 redis key: test, value: 10을 저장하고 그 값을 가져온다', async () => {
    const TEST_KEY = 'test';
    const TEST_VALUE = 10;
    await controller.setTestCache(TEST_KEY, TEST_VALUE);
    const cachedValue = await controller.getTestCache(TEST_KEY);
    expect(cachedValue).toEqual(10);
  });
});
