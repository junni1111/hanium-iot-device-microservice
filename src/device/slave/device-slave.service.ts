import { Injectable } from '@nestjs/common';
import { SlaveRepository } from '../repositories/slave.repository';
import { CreateSlaveDto } from '../../api/dto/slave/create-slave.dto';
import { LedRepository } from '../repositories/led.repository';
import { WaterPumpRepository } from '../repositories/water-pump.repository';
import { ThermometerRepository } from '../repositories/thermometer.repository';
import { ISlaveConfigs } from '../interfaces/slave-configs';

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

  async getConfigs(masterId: number, slaveId: number) {
    try {
      const fetched = await this.slaveRepository.getConfigs(masterId, slaveId);
      if (!fetched) {
        return;
      }

      const configs: ISlaveConfigs = {
        rangeBegin: fetched.rangebegin,
        rangeEnd: fetched.rangeend,
        updateCycle: fetched.updatecycle,
        waterPumpCycle: fetched.waterpumpcycle,
        waterPumpRuntime: fetched.waterpumpruntime,
        ledCycle: fetched.ledcycle,
        ledRuntime: fetched.ledruntime,
      };

      return configs;
    } catch (e) {
      throw new Error(e);
    }
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
