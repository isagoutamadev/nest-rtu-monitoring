import { ApiProperty } from "@nestjs/swagger";
import { MinLength, IsString, IsNotEmpty, IsIP, IsOptional, Min, IsInt, IsIn, ValidateIf } from "class-validator";

export class CreateMdDto {    
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
    
    @ApiProperty()
    @IsIn([0, 1], { message: 'Status virtual tidak valid' })
    @IsNotEmpty({ message: 'Status virtual wajib diisi' })
    is_virtual: number;

    @ApiProperty()
    @IsIn([0, 1], { message: 'Status backup tidak valid' })
    @IsInt()
    @IsNotEmpty({ message: 'Status backup wajib diisi' })
    is_backup: number;
}
