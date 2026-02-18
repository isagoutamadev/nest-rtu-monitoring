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
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { AUTH } from 'src/decorators/auth.decorator';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Parameter Tag')
@ApiBearerAuth('JWT')
@Controller('parameter/tags')
export class TagController {
    constructor(private readonly tagService: TagService) {}

    @Post()
    async create(@AUTH() auth, @Body() data: CreateTagDto) {
        return await this.tagService.create(data, auth);
    }

    @Get()
    async findAll(@Query() paging: PaginationDto) {
        return await this.tagService.findAll(paging);
    }

    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string) {
        return await this.tagService.findOne(uuid);
    }

    @Patch(':uuid')
    async update(
        @AUTH() auth,
        @Param('uuid') uuid: string,
        @Body() data: UpdateTagDto,
    ) {
        return await this.tagService.update(uuid, data, auth);
    }

    @Delete(':uuid')
    async remove(@AUTH() auth, @Param('uuid') uuid: string) {
        return await this.tagService.remove(uuid, auth);
    }
}
