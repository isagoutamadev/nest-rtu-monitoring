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
import { ApiService } from './api.service';
import { CreateApiDto } from './dto/create-api.dto';
import { UpdateApiDto } from './dto/update-api.dto';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { AUTH } from 'src/decorators/auth.decorator';
import { Auth } from 'src/resources/auth/entities/auth.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Administration API')
@ApiBearerAuth('JWT')
@Controller('administration/apis')
export class ApiController {
    constructor(private readonly apiService: ApiService) {}

    @Post()
    create(@AUTH() auth, @Body() data: CreateApiDto) {
        data.expired_at = Math.floor(data.expired_at/1000);
        return this.apiService.create(data, auth);
    }

    @Get()
    findAll(@Query() paging: PaginationDto) {
        return this.apiService.findAll(paging);
    }

    @Get(':uuid')
    findOne(@Param('uuid') uuid: string) {
        return this.apiService.findOne(uuid);
    }

    @Patch(':uuid')
    update(@Param('uuid') uuid: string, @Body() data: UpdateApiDto, @AUTH() auth) {
        data.expired_at = Math.floor(data.expired_at/1000);
        return this.apiService.update(uuid, data, auth);
    }

    @Delete(':uuid')
    remove(@Param('uuid') uuid: string, @AUTH() auth) {
        return this.apiService.remove(uuid, auth);
    }
}
