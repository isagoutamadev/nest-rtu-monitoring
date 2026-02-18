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
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { AUTH } from 'src/decorators/auth.decorator';
import { PaginationDto } from 'src/utils/pagination/pagination.dto';

@ApiTags('Administration Location')
@Controller('administration/locations')
@ApiBearerAuth('JWT')
export class LocationController {
    constructor(private readonly locationService: LocationService) {}

    @Post()
    create(@AUTH() auth: User, @Body() createLocationDto: CreateLocationDto) {
        return this.locationService.create(createLocationDto, auth);
    }

    @Get()
    findAll(@Query() paging: PaginationDto) {
        return this.locationService.findAll(paging);
    }

    @Get(':uuid')
    findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.locationService.findOne(uuid);
    }

    @Patch(':uuid')
    update(
        @AUTH() auth: User,
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() updateLocationDto: UpdateLocationDto,
    ) {
        return this.locationService.update(uuid, updateLocationDto, auth);
    }

    @Delete(':uuid')
    remove(@AUTH() auth: User, @Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.locationService.remove(uuid, auth);
    }
}
