import { EntityRepository, Repository } from 'typeorm';
import { Master } from '../entities/master.entity';
import { CreateMasterDto } from '../../api/dto/create-master.dto';

@EntityRepository(Master)
export class MasterRepository extends Repository<Master> {
  async createMaster({ masterId, address }: CreateMasterDto) {
    try {
      const master = this.create(Master.createMaster(masterId, address));

      return this.save(master);
    } catch (e) {
      console.log(e);
    }
  }
}
