import { Injectable } from '@nestjs/common';
import { SlaveRepository } from '../repositories/slave.repository';
import { CreateSlaveDto } from '../../api/dto/slave/create-slave.dto';
import { LedRepository } from '../repositories/led.repository';
import { WaterPumpRepository } from '../repositories/water-pump.repository';
import { ThermometerRepository } from '../repositories/thermometer.repository';

@Injectable()
export class DeviceSlaveService {
  constructor(
    private slaveRepository: SlaveRepository,
    private thermometerRepository: ThermometerRepository,
    private waterPumpRepository: WaterPumpRepository,
    private ledRepository: LedRepository,
  ) {}

  async createSlave(createSlaveDto: CreateSlaveDto) {
    const { masterId, slaveId } = createSlaveDto;
    try {
      const slave = await this.slaveRepository.createSlave(masterId, slaveId);
      if (!slave) {
        /** Todo: Throw Error */
        console.log(`Slave Create Error!`);
        return;
      }

      const water = await this.waterPumpRepository.setConfig(masterId, slaveId);
      const led = await this.ledRepository.setConfig(masterId, slaveId);
      const thermometer = await this.thermometerRepository.setConfigs(
        masterId,
        slaveId,
      );
      await Promise.all([water, led, thermometer]);

      return slave;
    } catch (e) {
      throw new Error(e);
    }
  }

  findSlave(masterId: number, slaveId: number) {
    return this.slaveRepository.findOne({ where: { masterId, slaveId } });
  }

  deleteSlave(masterId: number, slaveId: number) {
    return this.slaveRepository.deleteSlave(masterId, slaveId);
  }

  getConfigs(masterId: number, slaveId: number) {
    return this.slaveRepository
      .createQueryBuilder('slave')
      .where(`slave.masterId = :masterId`, { masterId })
      .andWhere(`slave.slaveId = :slaveId`, { slaveId })
      .leftJoinAndSelect('slave.thermometerConfig', 't')
      .leftJoinAndSelect('slave.ledConfig', 'led')
      .leftJoinAndSelect('slave.waterConfig', 'water')
      .select([
        't.rangeBegin AS rangeBegin',
        't.rangeEnd AS rangeEnd',
        't.updateCycle AS updateCycle',
        'led.ledCycle AS ledCycle',
        'led.ledRuntime AS ledRuntime',
        'water.waterPumpCycle AS waterPumpCycle',
        'water.waterPumpRuntime AS waterPumpRuntime',
      ])
      .getRawOne();
  }
  //
  // async createMaster(createMasterDto: CreateMasterDto) {
  //   const result = this.masterRepository.createMaster(createMasterDto);
  //   return result;
  // }

  // async createSlave(createSlaveDto: CreateSlaveDto) {
  //   const result = this.slaveRepository.createSlave(createSlaveDto);
  //
  //   return result;
  // }
  //
  // async optimize(masterId: number, slaveId: number) {
  //   return this.slaveRepository.setOptimizeConfigs(masterId, slaveId);
  // }
  //
  // async getConfigs(masterId: number, slaveId: number) {
  //   console.log(`get configs: `, masterId, slaveId);
  //   return this.slaveRepository.getConfigs(masterId, slaveId);
  // }
  //
  //
  // async deleteSlave(masterId: number, slaveId: number) {
  //   return this.slaveRepository.deleteSlave(masterId, slaveId);
  // }
}
