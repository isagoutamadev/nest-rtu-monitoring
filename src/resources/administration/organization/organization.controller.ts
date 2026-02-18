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
    NotFoundException,
    ParseEnumPipe,
    ParseBoolPipe,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AUTH } from 'src/decorators/auth.decorator';
import { User } from '../user/entities/user.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';
import { SearchOrganizationDto } from './dto/search-organization.dto';

@ApiTags('Administration Organization')
@Controller('administration/organizations')
@ApiBearerAuth('JWT')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) {}

    @Post()
    create(
        @AUTH() auth: User,
        @Body() createOrganizationDto: CreateOrganizationDto,
    ) {
        return this.organizationService.create(createOrganizationDto, auth);
    }

    @Get()
    findAll(
        @Query() paging: PaginationDto, 
        @Query() search: SearchOrganizationDto
    ) {
        return this.organizationService.findAll(paging, search);
    }
    
    @Get('hierarchy')
    async hierarchy(@Query('withDatel', ParseBoolPipe) withDatel: boolean) {
        console.log(withDatel);
        return await this.organizationService.hierarchy(withDatel);
    }

    @Get(':uuid')
    async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        const detail = await this.organizationService.findOne(uuid);
        if (!detail) {
            throw new NotFoundException('Organisasi tidek ditemukan');
        }
        return detail;
    }

    @Patch(':uuid')
    update(
        @AUTH() auth: User,
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() updateOrganizationDto: UpdateOrganizationDto,
    ) {
        return this.organizationService.update(
            uuid,
            updateOrganizationDto,
            auth,
        );
    }

    @Delete(':uuid')
    remove(@AUTH() auth: User, @Param('uuid') uuid: string) {
        return this.organizationService.remove(uuid, auth);
    }
}
