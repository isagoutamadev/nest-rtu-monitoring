import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsBooleanString, IsIn } from 'class-validator';
import { BooleanString } from 'src/interfaces/base-entity.interface';

export class SearchRtuDto {
    @ApiProperty({
        required: false,
    })
    @IsString()
    @IsOptional({})
    mdName?: string;

    @ApiProperty({
        required: false,
    })
    @IsString()
    @IsOptional({})
    mdIpAddress?: string;

    @ApiProperty({
        required: false,
    })
    @IsString()
    @IsOptional({})
    locationName?: string;

    @ApiProperty({
        required: false,
    })
    @IsString()
    @IsOptional({})
    ipAddress?: string;

    @ApiProperty({
        required: false,
    })
    @IsString()
    @IsOptional({})
    name?: string;

    @ApiProperty({
        required: false,
    })
    @IsString()
    @IsOptional({})
    sname?: string;

    @ApiProperty({
        required: false,
    })
    @IsString()
    @IsOptional({})
    description?: string;

    @ApiProperty({
        required: false,
    })
    @IsBooleanString()
    @IsOptional({})
    withPorts?: BooleanString;
}
