import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SlaveRepository } from './slave.repository';
import { CreateSlaveDto } from '../../api/slave/dto/create-slave.dto';
import { LedRepository } from '../repositories/led.repository';
import { WaterPumpRepository } from '../repositories/water-pump.repository';
import { ThermometerRepository } from '../repositories/thermometer.repository';
import { defaultSlaveConfig, ISlaveConfigs } from '../interfaces/slave-configs';
import { MasterRepository } from '../master/master.repository';

@Injectable()
export class DeviceSlaveService {
  constructor(
    private masterRepository: MasterRepository,
    private slaveRepository: SlaveRepository,
    private thermometerRepository: ThermometerRepository,
    private waterPumpRepository: WaterPumpRepository,
    private ledRepository: LedRepository,
  ) {}

  async createSlave(createSlaveDto: CreateSlaveDto) {
    const { masterId, slaveId } = createSlaveDto;

    try {
      const master = await this.masterRepository.findOne({
        where: { masterId },
      });

      if (!master) {
        /** Todo: Throw Error */
        console.log(`Master Not Found!`);
        return;
      }

      const ledConfig = this.ledRepository.create({ ...defaultSlaveConfig });
      const waterConfig = this.waterPumpRepository.create({
        ...defaultSlaveConfig,
      });
      const thermometerConfig = this.thermometerRepository.create({
        ...defaultSlaveConfig,
      });

      const exist = await this.slaveRepository.findOne({
        where: { master, slaveId },
      });

      if (exist) {
        /** Todo: handle exception */
        console.log(`Slave Exist!`);
        throw new ConflictException('Slave already exist!');
      }

      const slave = await this.slaveRepository.createSlave(
        master,
        slaveId,
        ledConfig,
        waterConfig,
        thermometerConfig,
      );
      if (!slave) {
        /** Todo: Throw Error */
        console.log(`Slave CreateM Error!`);
        throw new NotFoundException('Slave created exception!');
      }

      return slave;
    } catch (e) {
      throw e;
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

  clearSlaveDB() {
    return this.slaveRepository.createQueryBuilder().delete().execute();
  }
}
