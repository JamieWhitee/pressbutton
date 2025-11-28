import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';

export class PaginationQueryDto {
  @ApiProperty({
    description: 'Page number (starts from 1)',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class QuestionsQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Search term for question content',
    example: 'money',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by author ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  authorId?: number;

  @ApiProperty({
    description: 'Sort order',
    enum: ['newest', 'oldest', 'most_voted'],
    example: 'newest',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: 'newest' | 'oldest' | 'most_voted' = 'newest';
}
