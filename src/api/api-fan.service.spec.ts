import { FanPowerDto } from './dto/fan/fan-power.dto';

describe('Fan 서비스 테스트', () => {
  it('Fan power dto 테스트', async () => {
    const masterId = 100;
    const slaveId = 101;
    const mockFunction = ({ masterId, slaveId }: FanPowerDto) => {
      expect([masterId, slaveId]).toStrictEqual([100, 101]);
    };

    mockFunction({ masterId, slaveId });
  });
});
