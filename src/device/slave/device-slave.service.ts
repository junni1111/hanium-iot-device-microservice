import { Injectable } from '@nestjs/common';
import { CreateMasterDto } from '../../api/dto/master/create-master.dto';
import { SlaveRepository } from '../repositories/slave.repository';
import { Slave } from '../entities/slave.entity';
import { CreateSlaveDto } from '../../api/dto/slave/create-slave.dto';
import { Master } from '../entities/master.entity';

@Injectable()
export class DeviceSlaveService {
  constructor(private slaveRepository: SlaveRepository) {}

  createSlave(createSlaveDto: CreateSlaveDto) {
    return this.slaveRepository.createSlave(createSlaveDto);
  }

  findSlave(masterId: number, slaveId: number) {
    return this.slaveRepository.findOne({ where: { masterId, slaveId } });
  }

  deleteSlave(masterId: number, slaveId: number) {
    return this.slaveRepository.deleteSlave(masterId, slaveId);
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
