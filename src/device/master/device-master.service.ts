import { Injectable } from '@nestjs/common';
import { CreateMasterDto } from '../../api/master/dto/create-master.dto';
import { MasterRepository } from './master.repository';
import { Master } from './entities/master.entity';

@Injectable()
export class DeviceMasterService {
  constructor(private masterRepository: MasterRepository) {}

  createMaster(createMasterDto: CreateMasterDto): Promise<Master> {
    return this.masterRepository.createMaster(createMasterDto);
  }

  deleteMaster(masterId: number) {
    return this.masterRepository.delete({ masterId });
  }
<<<<<<< HEAD
=======

  clearMasterDB() {
    return this.masterRepository.createQueryBuilder().delete().execute();
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
>>>>>>> 5ec8e4fc78a05a7e3aed9b3f79b9f9725f6b0116
}
