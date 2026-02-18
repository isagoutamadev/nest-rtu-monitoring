import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateTagDto {
    @ApiProperty()
    @MinLength(3, { message: "Nama tag minimal 3 karakter" })
    @IsString()
    @IsNotEmpty({ message: "Nama tag harus diisi"})
    name: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;
}
