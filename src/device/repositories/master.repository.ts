import { EntityRepository, Repository } from 'typeorm';
import { Master } from '../master/entities/master.entity';
import { CreateMasterDto } from '../../api/master/dto/create-master.dto';

@EntityRepository(Master)
export class MasterRepository extends Repository<Master> {
  async createMaster(createMasterDto: CreateMasterDto): Promise<Master> {
    const { masterId, address } = createMasterDto;
    const master = this.create({
      masterId,
      address,
    });

    const exist = await this.findOne({ where: { masterId } });
    if (exist) {
      /** Todo: handle exception */
      return;
    }
    return this.save(master);
  }
}
