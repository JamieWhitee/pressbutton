import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'object' && errorResponse !== null) {
        // 类型安全的错误对象处理 / Type-safe error object handling
        const errorObj = errorResponse as Record<string, unknown>;
        message =
          (typeof errorObj.message === 'string'
            ? errorObj.message
            : exception.message) || exception.message;
        error =
          (typeof errorObj.error === 'string' ? errorObj.error : 'Error') ||
          'Error';
      } else {
        message = String(errorResponse);
        error = 'Error';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';

      // Log unexpected errors with proper type handling
      const errorMessage =
        exception instanceof Error
          ? `Unexpected error: ${exception.message}`
          : `Unexpected error: ${String(exception)}`;

      this.logger.error(
        errorMessage,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // Create standardized error response
    const errorResponse = ApiResponseDto.error(message, error);

    // Log the error with context
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      {
        statusCode: status,
        timestamp: errorResponse.timestamp,
        path: request.url,
        method: request.method,
        userAgent: request.get('User-Agent'),
      },
    );

    response.status(status).json(errorResponse);
  }
}
