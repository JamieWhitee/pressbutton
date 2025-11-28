import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 企业级全局异常处理器
 * Enterprise-grade global exception handler
 *
 * Features:
 * - 统一错误响应格式 / Unified error response format
 * - 结构化日志记录 / Structured logging
 * - 安全的错误信息过滤 / Secure error message filtering
 * - 请求上下文追踪 / Request context tracking
 * - 性能监控集成 / Performance monitoring integration
 */
@Catch()
export class EnterpriseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(EnterpriseExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const timestamp = new Date().toISOString();

    // 提取错误信息 / Extract error information
    const errorInfo = this.extractErrorInfo(exception);

    // 记录结构化日志 / Log structured information
    this.logError(request, errorInfo, timestamp);

    // 创建标准化响应 / Create standardized response
    const errorResponse = this.createErrorResponse(
      errorInfo,
      timestamp,
      request.url,
    );

    // 发送响应 / Send response
    response.status(errorInfo.status).json(errorResponse);
  }

  /**
   * 提取错误信息
   * Extract error information with type safety
   */
  private extractErrorInfo(exception: unknown): {
    status: number;
    message: string;
    error: string;
    isHttpException: boolean;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'object' && errorResponse !== null) {
        const errorObj = errorResponse as Record<string, unknown>;
        return {
          status,
          message: this.extractMessage(errorObj, exception.message),
          error: this.extractError(errorObj) || this.getHttpErrorName(status),
          isHttpException: true,
        };
      }

      return {
        status,
        message: String(errorResponse),
        error: this.getHttpErrorName(status),
        isHttpException: true,
      };
    }

    // 处理未预期的错误 / Handle unexpected errors
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
      isHttpException: false,
    };
  }

  /**
   * 安全地提取错误消息
   * Safely extract error message
   */
  private extractMessage(
    errorObj: Record<string, unknown>,
    fallback: string,
  ): string {
    if (Array.isArray(errorObj.message)) {
      return errorObj.message.join(', ');
    }
    return typeof errorObj.message === 'string' ? errorObj.message : fallback;
  }

  /**
   * 安全地提取错误类型
   * Safely extract error type
   */
  private extractError(errorObj: Record<string, unknown>): string | null {
    return typeof errorObj.error === 'string' ? errorObj.error : null;
  }

  /**
   * 根据HTTP状态码获取错误名称
   * Get error name by HTTP status code
   */
  private getHttpErrorName(status: number): string {
    const errorNames: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return errorNames[status] || 'Error';
  }

  /**
   * 记录结构化错误日志
   * Log structured error information
   */
  private logError(
    request: Request,
    errorInfo: {
      status: number;
      message: string;
      error: string;
      isHttpException: boolean;
    },
    timestamp: string,
  ): void {
    const logContext = {
      method: request.method,
      url: request.url,
      statusCode: errorInfo.status,
      timestamp,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      headers: this.sanitizeHeaders(request.headers),
    };

    if (errorInfo.isHttpException) {
      // HTTP异常 - 通常是预期的错误 / HTTP exceptions - usually expected errors
      this.logger.warn(
        `🔶 HTTP Exception: ${request.method} ${request.url} - ${errorInfo.status} - ${errorInfo.message}`,
        logContext,
      );
    } else {
      // 未预期的错误 - 需要特别关注 / Unexpected errors - need special attention
      this.logger.error(
        `🔴 Unexpected Error: ${request.method} ${request.url} - ${errorInfo.status} - ${errorInfo.message}`,
        logContext,
      );
    }
  }

  /**
   * 清理敏感的请求头信息
   * Sanitize sensitive header information
   */
  private sanitizeHeaders(
    headers: Record<string, unknown>,
  ): Record<string, unknown> {
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
    ];
    const sanitized = { ...headers };

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * 创建标准化错误响应
   * Create standardized error response
   */
  private createErrorResponse(
    errorInfo: { status: number; message: string; error: string },
    timestamp: string,
    path: string,
  ) {
    return {
      success: false,
      message: errorInfo.message,
      error: errorInfo.error,
      statusCode: errorInfo.status,
      timestamp,
      path,
      data: null,
    };
  }
}
