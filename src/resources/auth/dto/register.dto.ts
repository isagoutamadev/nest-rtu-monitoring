import { ApiProperty } from '@nestjs/swagger';
import {
    IsAlphanumeric,
    IsEmail,
    IsEmpty,
    IsInt,
    IsNotEmpty,
    IsString,
    Max,
    Min,
    MinLength,
} from 'class-validator';

export class RegisterDto {
    @ApiProperty()
    @MinLength(3, { message: 'Nama minimal 3 huruf' })
    @IsString()
    @IsNotEmpty({ message: 'Nama wajib diisi' })
    name: string;

    @ApiProperty()
    @IsInt()
    @Min(1, { message: 'Organisasi wajib diisi' })
    @IsNotEmpty({ message: 'Organisasi wajib diisi' })
    id_m_organization: number;

    @IsEmail(undefined, { message: 'Email tidak valid' })
    @IsNotEmpty({ message: 'Email wajib diisi' })
    email: string;

    @ApiProperty()
    @IsAlphanumeric(undefined, { message: 'Username hanya boleh angka dan huruf' })
    @MinLength(5, { message: 'Username minimal 5 huruf' })
    @IsNotEmpty({ message: 'Username wajib diisi' })
    username: string;

    @ApiProperty()
    @IsString()
    @MinLength(6, { message: 'Password minimal 6 karakter' })
    @IsNotEmpty({ message: 'Password wajib diisi' })
    password: string;

    @ApiProperty()
    @IsInt()
    @Min(0)
    @Max(1)
    @IsNotEmpty({ message: 'Mohon pilih LDAP atau Local' })
    is_ldap: number;

    @ApiProperty()
    @IsInt()
    @Min(1, { message: 'Role wajib diisi' })
    @IsNotEmpty({ message: 'Role wajib diisi' })
    role_id: number;
}
