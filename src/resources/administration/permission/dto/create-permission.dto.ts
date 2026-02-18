import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
export class CreatePermissionDto  {
    @ApiProperty()
    @MinLength(5, { message: 'Nama permission minimal 5 karakter' })
    @IsString()
    @IsNotEmpty({ message: 'Nama permission wajib diisi' })
    name: string;
    
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description: string;
}
