import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { MinLength, IsString, IsNotEmpty, IsIn, IsNumber, Min, IsOptional, IsInt } from "class-validator";

export class CreatePortDto {
    @ApiProperty()
    @Min(1, { message: 'Tipe perangkat wajib diisi' })
    @IsInt()
    @IsNotEmpty({ message: 'Tipe perangkat diisi' })
    id_m_device_type: number;
    
    @ApiProperty()
    @MinLength(3, { message: 'Nama minimal 3 karakter' })
    @IsString()
    @IsNotEmpty({ message: 'Nama wajib diisi' })
    name: string;

    @ApiProperty()
    @MinLength(3, { message: 'Identifier minimal 3 karakter' })
    @IsString()
    @Transform(({value}) => String(value).toLocaleUpperCase())
    @IsNotEmpty({ message: 'Identifier wajib diisi' })
    identifier: string;

    @ApiProperty()
    @IsIn(['analog', 'digital'])
    @IsNotEmpty({ message: 'Mode wajib dipilih salah satu' })
    mode: string;

    @ApiProperty()
    @Min(0.0000000001)
    @IsNumber()
    @IsNotEmpty({ message: 'Kalibrasi wajib diisi' })
    calibration_value: number;
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Satuan wajib diisi' })
    unit: string;

    @ApiProperty()
    @IsString()
    @Transform(({value}) => String(value).toLocaleUpperCase())
    @IsOptional()
    description: string;
}
