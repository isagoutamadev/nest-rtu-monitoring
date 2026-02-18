import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { MinLength, IsString, IsNotEmpty, IsOptional, Min, IsInt, Max } from "class-validator";

export class SearchOrganizationDto {
    @ApiProperty({required: false})
    @IsString()
    @IsOptional()
    name: string;
    
    @ApiProperty({required: false})
    @MinLength(2)
    @IsString()
    @IsOptional()
    sname: string;

    @ApiProperty({required: false})
    @Max(3)
    @Min(1)
    @IsInt()
    @Transform(({value}) => Number(value))
    @IsOptional()
    level: number;
}
