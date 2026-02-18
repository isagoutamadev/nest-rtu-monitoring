import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseUUIDPipe,
    NotFoundException,
} from '@nestjs/common';
import { MdService } from './md.service';
import { CreateMdDto } from './dto/create-md.dto';
import { UpdateMdDto } from './dto/update-md.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { AUTH } from 'src/decorators/auth.decorator';

@ApiTags('Parameter MD')
@ApiBearerAuth('JWT')
@Controller('parameter/mds')
export class MdController {
    constructor(private readonly mdService: MdService) {}

    @Post()
    async create(
        @AUTH() auth, 
        @Body() data: CreateMdDto
    ) {
        return await this.mdService.create(data, auth);
    }

    @Get()
    findAll(@Query() paging: PaginationDto) {
        return this.mdService.findAll(paging);
    }

    @Get(':uuid')
    async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        const detail = await this.mdService.findOne(uuid);
        if (detail) {
            return detail;
        }
        throw new NotFoundException('MD tidak ditemukan');
    }

    @Patch(':uuid')
    update(
        @AUTH() auth,
        @Param('uuid', ParseUUIDPipe) uuid: string, 
        @Body() updateMdDto: UpdateMdDto) {
        return this.mdService.update(uuid, updateMdDto, auth);
    }

    @Delete(':uuid')
    remove(
        @AUTH() auth,
        @Param('uuid', ParseUUIDPipe) uuid: string
    ) {
        return this.mdService.remove(uuid, auth);
    }
}
