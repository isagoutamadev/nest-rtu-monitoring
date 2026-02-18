import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
    Query,
} from '@nestjs/common';
import { FormulaTresholdsService } from './formula-tresholds.service';
import { CreateFormulaTresholdDto } from './dto/create-formula-treshold.dto';
import { UpdateFormulaTresholdDto } from './dto/update-formula-treshold.dto';
import { AUTH } from 'src/decorators/auth.decorator';
import { FormulaService } from '../formula/formula.service';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Parameter Formula Treshold')
@ApiBearerAuth('JWT')
@Controller('parameter/formulas/:formulaUuid/tresholds')
export class FormulaTresholdsController {
    constructor(
        private readonly formulaTresholdsService: FormulaTresholdsService,
        private readonly formulaService: FormulaService,
    ) {}

    @Post()
    async create(
        @Param('formulaUuid', ParseUUIDPipe) formulaUuid: string,
        @Body() data: CreateFormulaTresholdDto,
        @AUTH() auth,
    ) {
        const formula = await this.formulaService.findOne(formulaUuid);

        return this.formulaTresholdsService.create(formula, data, auth);
    }

    @Get()
    findAll(
        @Param('formulaUuid', ParseUUIDPipe) formulaUuid: string,
        @Query() paging: PaginationDto,
    ) {
        return this.formulaTresholdsService.findAll(formulaUuid, paging);
    }

    @Get(':uuid')
    findOne(@Param('uuid') uuid: string) {
        return this.formulaTresholdsService.findOne(uuid);
    }

    @Patch(':uuid')
    async update(
        @Param('formulaUuid', ParseUUIDPipe) formulaUuid: string,
        @Param('uuid') uuid: string,
        @Body() data: UpdateFormulaTresholdDto,
        @AUTH() auth,
    ) {
        const formula = await this.formulaService.findOne(formulaUuid);

        return this.formulaTresholdsService.update(formula, uuid, data, auth);
    }

    @Delete(':uuid')
    async remove(
        @Param('formulaUuid', ParseUUIDPipe) formulaUuid: string,
        @Param('uuid') uuid: string,
        @AUTH() auth,
    ) {
        const formula = await this.formulaService.findOne(formulaUuid);
        return this.formulaTresholdsService.remove(formula, uuid, auth);
    }
}
