import { Inject, Injectable } from '@nestjs/common';
import { MQTT_BROKER } from '../util/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { SlaveRepository } from './repositories/slave.repository';
import { MasterRepository } from './repositories/master.repository';
import {
  ILedConfig,
  ITemperatureConfig,
  IWaterPumpConfig,
} from './interfaces/slave-configs';
import { SlaveConfigDto } from '../api/dto/slave-config.dto';
import { CreateMasterDto } from '../api/dto/create-master.dto';
import { CreateSlaveDto } from '../api/dto/create-slave.dto';

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
    return this.slaveRepository.getConfigs(masterId, slaveId);
  }

  async setTemperatureConfig({
    masterId,
    slaveId,
    startTemperatureRange,
    endTemperatureRange,
    temperatureUpdateCycle,
  }: Partial<SlaveConfigDto>) {
    try {
      const config: ITemperatureConfig = {
        startTemperatureRange,
        endTemperatureRange,
        temperatureUpdateCycle,
      };
      return this.slaveRepository.setConfig(masterId, slaveId, config);
    } catch (e) {
      console.log(e);
    }
  }
  async setWaterPumpConfig({
    masterId,
    slaveId,
    waterPumpCycle,
    waterPumpRuntime,
  }: Partial<SlaveConfigDto>) {
    try {
      const config: IWaterPumpConfig = {
        waterPumpCycle,
        waterPumpRuntime,
      };
      return this.slaveRepository.setConfig(masterId, slaveId, config);
    } catch (e) {
      console.log(e);
    }
  }
  async setLedConfig({
    masterId,
    slaveId,
    ledCycle,
    ledRuntime,
  }: Partial<SlaveConfigDto>) {
    try {
      const config: ILedConfig = { ledCycle, ledRuntime };
      return this.slaveRepository.setConfig(masterId, slaveId, config);
    } catch (e) {
      console.log(e);
    }
  }
}
