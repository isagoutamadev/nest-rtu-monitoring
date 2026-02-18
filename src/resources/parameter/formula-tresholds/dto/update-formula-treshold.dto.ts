import { PartialType } from '@nestjs/swagger';
import { CreateFormulaTresholdDto } from './create-formula-treshold.dto';

export class UpdateFormulaTresholdDto extends PartialType(CreateFormulaTresholdDto) {}
