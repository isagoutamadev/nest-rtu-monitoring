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
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AUTH } from 'src/decorators/auth.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('Administration Permission')
@Controller('administration/permissions')
@ApiBearerAuth('JWT')
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}

    @Post()
    create(@AUTH() auth: User, @Body() data: CreatePermissionDto) {
        return this.permissionService.create(data, auth);
    }

    @Get()
    findAll(@Query() paging: PaginationDto) {
        return this.permissionService.get(paging);
    }

    @Get(':uuid')
    async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        const data = await this.permissionService.findOne(uuid);
        if (!data) {
            throw new NotFoundException()
        }
        return data;
    }

    @Patch(':uuid')
    update(
        @AUTH() auth: User,
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() updatePermissionDto: UpdatePermissionDto,
    ) {
        return this.permissionService.update(uuid, updatePermissionDto, auth);
    }

    @Delete(':uuid')
    remove(@AUTH() auth: User, @Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.permissionService.remove(uuid, auth);
    }
}
