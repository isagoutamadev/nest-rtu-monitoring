import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMdDto } from './create-md.dto';
import { Min, IsInt, IsNotEmpty, ValidateIf, IsIP, IsString, MinLength, IsIn } from 'class-validator';

export class UpdateMdDto {
    @ApiProperty()
    @Min(1, { message: 'RRD wajib diisi' })
    @IsInt()
    @IsNotEmpty({ message: 'RRD wajib diisi' })
    id_m_rrd: number;

    @ApiProperty()
    @Min(1, { message: 'Lokasi wajib diisi' })
    @IsInt()
    @IsNotEmpty({ message: 'Lokasi wajib diisi'})
    @ValidateIf(o => o.is_virtual === 0)
    id_m_location?: number;

    @ApiProperty()
    @Min(1, { message: 'MD backup wajib diisi' })
    @IsInt()
    @IsNotEmpty({ message: 'MD backup wajib diisi'})
    @ValidateIf(o => o.is_backup === 0)
    id_m_md_backup?: number;

    @ApiProperty()
    @IsIP(4, { message: 'IP tidak valid'})
    @IsString()
    @IsNotEmpty({ message: 'IP wajib diisi' })
    ip_address: string;
    
    @ApiProperty()
    @Min(8001, { message: 'Port minimal 8001' })
    @IsInt()
    @IsNotEmpty({ message: 'Port wajib diisi' })
    port: number;

    @ApiProperty()
    @MinLength(3, { message: 'Nama minimal 3 karakter' })
    @IsString()
    @IsNotEmpty({ message: 'Nama wajib diisi' })
    name: string;
}
