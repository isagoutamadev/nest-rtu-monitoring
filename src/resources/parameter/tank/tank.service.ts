import { Injectable } from '@nestjs/common';
import { UpdateTankDto } from './dto/update-tank.dto';

@Injectable()
export class TankService {
    findAll() {
        return `This action returns all tank`;
    }

    findOne(id: number) {
        return `This action returns a #${id} tank`;
    }

    update(id: number, updateTankDto: UpdateTankDto) {
        return `This action updates a #${id} tank`;
    }

    remove(id: number) {
        return `This action removes a #${id} tank`;
    }
}
