import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    NotFoundException,
    Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AUTH } from 'src/decorators/auth.decorator';
import { User } from '../user/entities/user.entity';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';

@ApiTags('Administration Role')
@Controller('administration/roles')
@ApiBearerAuth('JWT')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    create(@AUTH() auth: User, @Body() createRoleDto: CreateRoleDto) {
        return this.roleService.create(createRoleDto, auth);
    }

    @Get()
    findAll(@Query() paging: PaginationDto) {
        return this.roleService.findAll(paging);
    }

    @Get(':uuid')
    findOne(@Param('uuid') uuid: string) {
        return this.roleService.findOne(uuid);
    }

    @Patch(':uuid')
    async update(
        @AUTH() auth: User,
        @Param('uuid') uuid: string,
        @Body() updateRoleDto: UpdateRoleDto,
    ) {
        const detail = await this.roleService.update(uuid, updateRoleDto, auth);
        if (detail) {
            return detail;
        }

        throw new NotFoundException('Role tidak ditemukan');
    }

    @Delete(':uuid')
    async remove(@AUTH() auth: User, @Param('uuid') uuid: string) {
        const isDeleted = await this.roleService.remove(uuid, auth);
        if (isDeleted) {
            return true;
        }

        throw new NotFoundException('Role tidak ditemukan');
    }
}
