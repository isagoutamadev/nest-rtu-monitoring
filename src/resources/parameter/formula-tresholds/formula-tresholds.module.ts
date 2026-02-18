import { Module } from '@nestjs/common';
import { FormulaTresholdsService } from './formula-tresholds.service';
import { FormulaTresholdsController } from './formula-tresholds.controller';
import { FormulaService } from '../formula/formula.service';

@Module({
    controllers: [FormulaTresholdsController],
    providers: [FormulaTresholdsService, FormulaService],
})
export class FormulaTresholdsModule {}
