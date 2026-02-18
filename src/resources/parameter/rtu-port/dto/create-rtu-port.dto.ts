import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { Min, IsInt, IsNotEmpty, IsIP, IsString, MinLength, IsOptional, ArrayMinSize, IsArray, IsEnum, IsIn, Length } from "class-validator";
import { CreateTankDto } from "../../tank/dto/create-tank.dto";

export class CreateRtuPortDto {
    @ApiProperty()
    @IsInt()
    @IsOptional()
    id_m_device_topology?: number;

    @ApiProperty()
    @Min(1, { message: 'Tipe port wajib diisi' })
    @IsInt()
    @IsNotEmpty({ message: 'Tipe port wajib diisi'})
    id_m_port: number;

    @ApiProperty()
    @IsIn([0,1], { message: 'Status monitor tidak valid' })
    @IsNotEmpty({ message: 'Status monitor wajib diisi' })
    is_monitored: number;
    
    @ApiProperty()
    @IsIn([0,1], { message: 'Status notif tidak valid' })
    @IsNotEmpty({ message: 'Status notif wajib diisi' })
    is_notified: number;

    @ApiProperty()
    @Length(4, 4, { message: 'No Port tidak valid' })
    @IsString()
    @IsNotEmpty({ message: 'Nama wajib diisi' })
    no_port: string;

    @ApiProperty()
    @IsString()
    @IsOptional({})
    description?: string;

    @ApiProperty()
    tank: CreateTankDto;
}
