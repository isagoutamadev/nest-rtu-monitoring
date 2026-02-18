import { ApiProperty } from "@nestjs/swagger";
import { MinLength, IsString, IsNotEmpty, Min, IsInt, IsOptional, IsNumber, isIP, IsIP } from "class-validator";

export class CreateRrdDto {
    @ApiProperty()
    @MinLength(3, { message: 'Nama minimal 3 karakter' })
    @IsString()
    @IsNotEmpty({ message: 'Nama wajib diisi' })
    name: string;

    @ApiProperty()
    @IsIP(4, { message: 'IP tidak valid'})
    @IsString()
    @IsNotEmpty({ message: 'IP wajib diisi' })
    ip_address: string;
}
