import { EntityRepository, Repository } from 'typeorm';
import { LedConfig } from '../led/entities/led.entity';
import { Slave } from '../slave/entities/slave.entity';
import { LedConfigDto } from '../../api/led/dto/led-config.dto';
import { NotFoundException } from '@nestjs/common';

@EntityRepository(LedConfig)
export class LedRepository extends Repository<LedConfig> {
  updateConfig(slave: Slave, configDto: LedConfigDto) {
    const { ledCycle, ledRuntime } = configDto;

    return this.createQueryBuilder()
      .update(LedConfig)
      .set({ ledCycle, ledRuntime })
      .where('id = :id', { id: slave.ledFK })
      .execute();
  }

  findBySlave(masterId: number, slaveId: number): Promise<LedConfig> {
    return this.createQueryBuilder('led')
      .leftJoinAndSelect('led.slave', 'slave')
      .where(`slave.masterId = :masterId`, { masterId })
      .andWhere(`slave.slaveId = :slaveId`, { slaveId })
      .select(['led.ledCycle', 'led.ledRuntime'])
      .getOne();
  }

  clearLedDB() {
    return this.createQueryBuilder().delete().execute();
  }
}
