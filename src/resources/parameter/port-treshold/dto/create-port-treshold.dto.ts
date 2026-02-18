import { ApiProperty } from "@nestjs/swagger";
import { Min, IsInt, IsNotEmpty, IsString, MinLength, IsOptional } from "class-validator";

export class CreatePortTresholdDto {
    @ApiProperty()
    @Min(1, { message: 'Severity wajib diisi' })
    @IsInt()
    @IsNotEmpty({ message: 'Severity wajib diisi'})
    id_m_severity: number;

    @ApiProperty()
    @MinLength(5, { message: 'Rule tidak valid'})
    @IsString()
    @IsNotEmpty({ message: 'Rule wajib diisi' })
    rule: string;
    
    @ApiProperty()
    @MinLength(3, { message: 'Label minimal 3 karatkter'})
    @IsString()
    @IsNotEmpty({ message: 'Label wajib diisi' })
    label: string;
 
    @Min(5, { message: 'Durasi minimal 5 detik'})
    @IsInt()
    @IsNotEmpty({ message: 'Durasi(detik) wajib diisi' })
    duration: number;
    
    @ApiProperty()
    @IsString()
    @IsOptional()
    description: string;
}

