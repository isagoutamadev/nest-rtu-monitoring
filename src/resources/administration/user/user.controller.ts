import { Body, Controller, Delete, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AUTH } from 'src/decorators/auth.decorator';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { PermissionGuard } from 'src/guards/permission.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Administration User')
@Controller('administration/users')
@ApiBearerAuth('JWT')
export class UserController {
    constructor(private readonly service: UserService) {}

    @Get('')
    @UseGuards(PermissionGuard('administration_user_view'))
    async get(
        @Query() search: PaginationDto
    ) { 
        return await this.service.get(search);
    }
    
    @Post('')
    // @UseGuards(PermissionGuard('administration_user_view'))
    async create(
        @AUTH() auth: User,
        @Body() data: CreateUserDto
    ) { 
        return await this.service.create(data, auth);
    }

    @Get(':uuid')
    findOne(@Param('uuid') uuid: string) {
        return this.service.findOne(uuid);
    }

    @Patch(':uuid')
    // @UseGuards(PermissionGuard('administration_user_view'))
    async update(
        @AUTH() auth: User,
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() data: CreateUserDto
    ) { 
        return await this.service.update(uuid, data, auth);
    }
    
    @Delete(':uuid')
    // @UseGuards(PermissionGuard('administration_user_view'))
    async remove(
        @AUTH() auth: User,
        @Param('uuid', ParseUUIDPipe) uuid: string
    ) {
        const isDeleted = await this.service.remove(uuid, auth);

        if (isDeleted) {
            return true;
        }
        
        throw new NotFoundException("User tidak ditemukan");  
    }

    
}
