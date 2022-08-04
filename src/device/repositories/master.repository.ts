import { EntityRepository, Repository } from 'typeorm';
import { Master } from '../master/entities/master.entity';
import { CreateMasterDto } from '../../api/dto/master/create-master.dto';

@EntityRepository(Master)
export class MasterRepository extends Repository<Master> {
  createMaster(createMasterDto: CreateMasterDto): Promise<Master> {
    const { masterId, address } = createMasterDto;
    const master = this.create({
      masterId: masterId,
      address: address,
    });
    return this.save(master);
  }
}
