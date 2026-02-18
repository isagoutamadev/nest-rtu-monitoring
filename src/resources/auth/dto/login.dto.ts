import { ApiProperty } from '@nestjs/swagger';
import {
    IsAlphanumeric,
    MinLength,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class LoginDto {
    @ApiProperty()
    @IsAlphanumeric(undefined, {
        message: 'Username hanya boleh angka dan huruf',
    })
    @MinLength(5, { message: 'Username minimal 5 huruf' })
    @IsNotEmpty({ message: 'Username wajib diisi' })
    username: string;

    @ApiProperty()
    @IsString()
    @MinLength(6, { message: 'Password minimal 6 karakter' })
    @IsNotEmpty({ message: 'Password wajib diisi' })
    password: string;
}
