import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsString, Min, MinDate, MinLength, Validate } from "class-validator";

export class CreateApiDto {
    @ApiProperty()
    @MinLength(5, { message: 'Nama API minimal 5 karakter'})
    @IsString()
    @IsNotEmpty({ message: 'Nama API wajib diisi'})
    name: string;

    @ApiProperty()
    @Min(Date.now(), { message: 'Waktu expired harus lebih dari waktu saat ini'})
    @IsInt()
    @IsNotEmpty({ message: 'Waktu expired wajib diisi'})
    expired_at: EpochTimeStamp;

    @ApiProperty({ isArray: true })
    @Min(1, { message: 'Role wajib diisi!', each: true })
    @IsInt({each: true})
    @ArrayMinSize(1, { message: 'Minimal satu role' })
    @IsArray()
    @IsNotEmpty({ message: 'Role wajib diisi' })
    role_ids: number[];
}
