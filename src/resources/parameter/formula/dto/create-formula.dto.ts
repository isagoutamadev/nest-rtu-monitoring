import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { Min, IsInt, IsNotEmpty, MinLength, IsString, IsIn, IsNumber, IsOptional } from "class-validator";
import { PortMode } from "../../port/entities/port.entity";

export class CreateFormulaDto {
    @ApiProperty()
    @MinLength(3, { message: 'Identifier minimal 3 karakter' })
    @Transform(({value}) => String(value).toUpperCase())
    @IsString()
    @IsNotEmpty({ message: 'Indentifier wajib diisi' })
    identifier: string;
    
    @ApiProperty()
    @MinLength(3, { message: 'Nama minimal 3 karakter' })
    @IsString()
    @IsNotEmpty({ message: 'Nama wajib diisi' })
    name: string;
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Satuan wajib diisi' })
    unit: string;
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty({ message: 'Formula wajib diisi' })
    formula: string;

    @ApiProperty()
    @IsIn(['analog', 'digital'], { message: 'Mode tidak valid' })
    @IsString()
    @IsNotEmpty({ message: 'Mode wajib diisi' })
    mode: PortMode;

    @ApiProperty()
    @IsIn([0,1], { message: 'Identifier minimal 3 karakter' })
    @IsInt()
    @IsNotEmpty()
    is_specific_port: number;
}
