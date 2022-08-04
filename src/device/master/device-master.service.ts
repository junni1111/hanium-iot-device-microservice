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
}
