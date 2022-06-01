import { Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { SlaveRepository } from '../repositories/slave.repository';
import { MasterRepository } from '../repositories/master.repository';
import { CreateMasterDto } from '../../api/dto/master/create-master.dto';
import { CreateSlaveDto } from '../../api/dto/slave/create-slave.dto';

@Injectable()
export class DeviceMasterService {
  constructor(
    @Inject(MQTT_BROKER) private readonly mqttBroker: ClientProxy,
    private readonly masterRepository: MasterRepository,
    private readonly slaveRepository: SlaveRepository,
  ) {}

  async createMaster(createMasterDto: CreateMasterDto) {
    const result = this.masterRepository.createMaster(createMasterDto);

    return result;
  }

  async createSlave(createSlaveDto: CreateSlaveDto) {
    const result = this.slaveRepository.createSlave(createSlaveDto);

    return result;
  }

  async optimize(masterId: number, slaveId: number) {
    return this.slaveRepository.setOptimizeConfigs(masterId, slaveId);
  }

  async getConfigs(masterId: number, slaveId: number) {
    console.log(`get configs: `, masterId, slaveId);
    return this.slaveRepository.getConfigs(masterId, slaveId);
  }

  async deleteMaster(masterId: number) {
    return this.masterRepository.deleteMaster(masterId);
  }

  async deleteSlave(masterId: number, slaveId: number) {
    return this.slaveRepository.deleteSlave(masterId, slaveId);
  }
}
