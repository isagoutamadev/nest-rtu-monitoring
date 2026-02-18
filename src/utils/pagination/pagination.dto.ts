import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from "class-validator";

enum SortEnum {
    ASC = 'asc',
    DESC = 'desc'
}

export class PaginationDto {
    @ApiProperty({ required: false})
    @Min(1)
    @IsInt()
    @Transform(({value}) => Number(value))
    @IsOptional()
    limit?: number;

    @ApiProperty({ required: false})
    @Min(1)
    @IsInt()
    @Transform(({value}) => Number(value))
    @IsOptional()
    page?: number;
    
    @ApiProperty({ required: false, enum: SortEnum })
    @IsEnum(SortEnum)
    @IsOptional()
    sort?: SortEnum;
};