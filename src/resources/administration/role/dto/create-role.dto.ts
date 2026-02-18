import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, Min, MinLength } from "class-validator";

export class CreateRoleDto {
    @ApiProperty()
    @MinLength(5)
    @IsNotEmpty({ message: 'Nama wajib diisi' })
    name: string;

    @ApiProperty({ required: false })
    description: string;

    @ApiProperty({ isArray: true })
    @Min(1, { message: 'Permission wajib diisi!', each: true })
    @IsInt({each: true})
    @ArrayMinSize(1, { message: 'Minimal satu permission' })
    @IsArray()
    @IsNotEmpty({ message: 'Permission wajib diisi' })
    permission_ids: number[];
}
