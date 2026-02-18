import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { MinLength, IsString, IsNotEmpty, Min, IsInt, IsOptional, IsNumber, Length } from "class-validator";

export class CreateLocationDto {
    @ApiProperty()
    @MinLength(5, { message: 'Nama minimal 5 karakter' })
    @IsString()
    @IsNotEmpty({ message: 'Nama wajib diisi' })
    name: string;
    
    @ApiProperty()
    @Transform(({value}) => String(value).toUpperCase())
    @Length(3, 3, { message: 'Sname harus 3 karakter'})
    @IsString()
    @IsNotEmpty()
    sname: string;

    @ApiProperty({description: "Isi Dengan m_users.id"})
    @Min(1)
    @IsInt()
    @IsNotEmpty()
    pic: number;

    @ApiProperty()
    @Min(1)
    @IsInt()
    @IsNotEmpty({ message: 'Datel wajib diisi' })
    id_m_organization: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    latitude: number;

    @ApiProperty({description: "Isi Dengan m_users.id"})
    @IsNumber()
    @IsOptional()
    longitude: number;
    
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    address: string;
}
