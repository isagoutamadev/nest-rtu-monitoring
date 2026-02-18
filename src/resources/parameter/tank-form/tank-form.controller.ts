import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { TankFormService } from './tank-form.service';

@Controller('tank-form')
export class TankFormController {
    constructor(private readonly tankFormService: TankFormService) {}
    @Get()
    findAll() {
        return this.tankFormService.findAll();
    }
}
