import {
    Controller,
    Get,
} from '@nestjs/common';
import { SeverityService } from './severity.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Parameter Severity')
@ApiBearerAuth('JWT')
@Controller('parameter/severities')
export class SeverityController {
    constructor(private readonly severityService: SeverityService) {}

    @Get()
    findAll() {
        return this.severityService.findAll();
    }
}
