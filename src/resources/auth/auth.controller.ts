import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { compareSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';

@ApiTags(' Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly service: AuthService,
        private readonly jwtService: JwtService
    ) {}

    @HttpCode(200)
    @Post('login')
    async login(@Body() data: LoginDto) {
        try {
            const user = await this.service.login(data);

            if (!user) {
                throw new HttpException("User tidak ditemukan", HttpStatus.UNPROCESSABLE_ENTITY);
            }

            if (!compareSync(data.password, user.password)) {
                throw new HttpException("Password salah", HttpStatus.UNPROCESSABLE_ENTITY);
            }

            if (user.is_active === 0) {
                throw new HttpException("User tidak aktif", HttpStatus.UNPROCESSABLE_ENTITY);
            }

            delete user.password;
            user.permissions = await this.service.getUserPermissions(user.id);
            return {
                token: await this.jwtService.signAsync({ id: user.id }),
                profile: user
            };
        } catch (error) {
            throw error;
        }
    }

    @Post('register')
    async register(@Body() data: RegisterDto) {
        try {
            return await this.service.register(data);
        } catch (error) {
            throw error;
        }
    }
}
