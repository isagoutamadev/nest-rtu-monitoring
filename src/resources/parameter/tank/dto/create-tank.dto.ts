import { ApiProperty, PartialType } from '@nestjs/swagger';
import { TankType } from '../entities/tank.entity';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreateTankDto {
    @ApiProperty()
    @Min(1, { message: 'Bentuk Tanki wajib dipilih' })
    @IsInt()
    @IsNotEmpty()
    id_m_tank_form: number;

    @ApiProperty()
    @MinLength(3, { message: 'Nama Tanki minimal 3 huruf' })
    @IsString()
    @IsNotEmpty({ message: 'Nama wajib diisi' })
    name: string;

    @ApiProperty()
    @IsEnum(TankType)
    @IsNotEmpty({ message: 'Tipe tangki wajib dipilih' })
    type: TankType;

    @ApiProperty()
    @Min(1, { message: 'Kapasitas Tanki wajib diisi' })
    @IsNumber()
    @IsNotEmpty()
    tank_capacity: number;

    @ApiProperty()
    @Min(1, { message: 'Panjang Tanki wajib diisi' })
    @IsNumber()
    @IsNotEmpty()
    tank_length: number;

    @ApiProperty()
    @Min(1, { message: 'Tinggi Tanki wajib diisi' })
    @IsNumber()
    @IsNotEmpty()
    tank_height: number;

    @ApiProperty()
    @Min(1, { message: 'Lebar Tanki wajib diisi' })
    @IsNumber()
    @IsNotEmpty()
    tank_wide: number;

    @ApiProperty()
    @Min(1, { message: 'Kapasitas Mesin wajib diisi' })
    @IsNumber()
    @IsNotEmpty()
    engine_capacity: number;

    @ApiProperty()
    @Min(1, { message: 'Power wajib diisi' })
    @IsNumber()
    @IsNotEmpty()
    power: number;

    @ApiProperty()
    @Min(1, { message: 'Konsumsi BBM per jam wajib diisi' })
    @IsNumber()
    @IsNotEmpty()
    fuel_consumption: number;
}
