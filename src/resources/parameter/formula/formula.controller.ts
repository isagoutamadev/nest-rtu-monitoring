import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { FormulaService } from './formula.service';
import { CreateFormulaDto } from './dto/create-formula.dto';
import { UpdateFormulaDto } from './dto/update-formula.dto';
import { AUTH } from 'src/decorators/auth.decorator';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Parameter Formula')
@ApiBearerAuth('JWT')
@Controller('parameter/formulas')
export class FormulaController {
    constructor(private readonly formulaService: FormulaService) {}

    @Post()
    create(@AUTH() auth, @Body() data: CreateFormulaDto) {
        return this.formulaService.create(data, auth);
    }

    @Get()
    findAll(@Query() paging: PaginationDto) {
        return this.formulaService.findAll(paging);
    }

    @Get(':uuid')
    findOne(@Param('uuid') uuid: string) {
        return this.formulaService.findOne(uuid);
    }

    @Patch(':uuid')
    update(
        @AUTH() auth,
        @Param('uuid') uuid: string,
        @Body() data: UpdateFormulaDto,
    ) {
        return this.formulaService.update(uuid, data, auth);
    }

    @Delete(':uuid')
    remove(@Param('uuid') uuid: string, @AUTH() auth,) {
        return this.formulaService.remove(uuid, auth);
    }
}
