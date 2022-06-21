import { Test, TestingModule } from '@nestjs/testing';
import { DeviceTemperatureController } from './device-temperature.controller';

describe('DeviceTemperatureController', () => {
  let controller: DeviceTemperatureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceTemperatureController],
    }).compile();

    controller = module.get<DeviceTemperatureController>(
      DeviceTemperatureController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
