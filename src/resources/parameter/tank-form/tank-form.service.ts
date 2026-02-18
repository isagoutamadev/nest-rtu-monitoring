import { Injectable } from '@nestjs/common';

@Injectable()
export class TankFormService {
    findAll() {
        return `This action returns all tankForm`;
    }

    findById(id: number) {
        return `This action returns a #${id} tankForm`;
    }
}
