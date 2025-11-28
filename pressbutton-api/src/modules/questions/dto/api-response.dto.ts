import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Request success status' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Response data' })
  data?: T;

  @ApiProperty({ description: 'Error details', required: false })
  error?: string;

  @ApiProperty({ description: 'Response timestamp' })
  timestamp: string;

  constructor(success: boolean, message: string, data?: T, error?: string) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message = 'Success'): ApiResponseDto<T> {
    return new ApiResponseDto(true, message, data);
  }

  static error(message: string, error?: string): ApiResponseDto<null> {
    return new ApiResponseDto(false, message, null, error);
  }
}

export class PaginationDto {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of items', example: 100 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;
}

export class PaginatedResponseDto<T> extends ApiResponseDto<T[]> {
  @ApiProperty({ description: 'Pagination metadata' })
  pagination: PaginationDto;

  constructor(data: T[], pagination: PaginationDto, message = 'Success') {
    super(true, message, data);
    this.pagination = pagination;
  }
}
