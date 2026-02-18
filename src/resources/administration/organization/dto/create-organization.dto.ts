import { ApiProperty } from "@nestjs/swagger";
import { MinLength, IsString, IsNotEmpty, IsOptional, Min, IsInt } from "class-validator";

export class CreateOrganizationDto {
    @ApiProperty()
    @MinLength(5, { message: 'Nama minimal 5 karakter' })
    @IsString()
    @IsNotEmpty({ message: 'Nama wajib diisi' })
    name: string;
    
    @ApiProperty()
    @MinLength(2)
    @IsString()
    @IsNotEmpty()
    sname: string;

    @ApiProperty()
    @Min(1)
    @IsInt()
    @IsNotEmpty({ message: 'Parent wajib diisi' })
    parent_id: number;
    
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    address: string;
}
