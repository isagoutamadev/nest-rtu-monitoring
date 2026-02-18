import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { Min, IsInt, IsNotEmpty, ValidateIf, IsIP, IsString, MinLength, IsIn, IsOptional, IsArray, ArrayMinSize } from "class-validator";

export class CreateRtuDto {
    @ApiProperty()
    @Min(1, { message: 'MD wajib diisi' })
    @IsInt()
    @IsNotEmpty({ message: 'MD wajib diisi' })
    id_m_md: number;

    @ApiProperty()
    @Min(1, { message: 'Lokasi wajib diisi' })
    @IsInt()
    @IsNotEmpty({ message: 'Lokasi wajib diisi'})
    id_m_location: number;

    @ApiProperty()
    @IsIP(4, { message: 'IP tidak valid'})
    @IsString()
    @IsNotEmpty({ message: 'IP wajib diisi' })
    ip_address: string;

    @ApiProperty()
    @MinLength(3, { message: 'Nama minimal 3 karakter' })
    @IsString()
    @IsNotEmpty({ message: 'Nama wajib diisi' })
    name: string;

    @ApiProperty()
    @MinLength(10, { message: 'SNAME minimal 10 karakter' })
    @Transform(({value}) => String(value).toUpperCase())
    @IsString()
    @IsNotEmpty({ message: 'SNAME wajib diisi' })
    sname: string;

    @ApiProperty()
    @IsString()
    @IsOptional({})
    description?: string;

    @ApiProperty()
    @Min(1, { each: true, message: 'Tag wajib diisi!!' })
    @IsInt({each: true})
    @ArrayMinSize(1, { message: 'Tag wajib diisi!' })
    @IsArray()
    @IsNotEmpty({ message: 'Tag wajib diisi'})
    tag_ids: number[];
}
