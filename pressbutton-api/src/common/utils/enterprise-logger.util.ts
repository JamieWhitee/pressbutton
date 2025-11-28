import { Logger } from '@nestjs/common';

/**
 * 企业级日志标准化工具
 * Enterprise-grade logging standardization utility
 */
export class EnterpriseLogger {
  private readonly logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  /**
   * 记录操作开始日志
   * Log operation start
   */
  logOperationStart(operation: string, data?: unknown): void {
    this.logger.log(
      `🔧 ${operation} started${data ? `: ${JSON.stringify(data)}` : ''}`,
    );
  }

  /**
   * 记录操作成功日志
   * Log operation success
   */
  logOperationSuccess(operation: string, result?: unknown): void {
    this.logger.log(
      `✅ ${operation} completed successfully${result ? `: ${JSON.stringify(result)}` : ''}`,
    );
  }

  /**
   * 记录操作失败日志
   * Log operation error
   */
  logOperationError(
    operation: string,
    error: unknown,
    context?: unknown,
  ): void {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.logger.error(
      `❌ ${operation} failed: ${errorMessage}${context ? ` | Context: ${JSON.stringify(context)}` : ''}`,
      errorStack,
    );
  }

  /**
   * 记录删除操作日志
   * Log deletion operation
   */
  logDeletion(target: string, data: unknown): void {
    this.logger.log(`🗑️ Deleting ${target}: ${JSON.stringify(data)}`);
  }

  /**
   * 记录创建操作日志
   * Log creation operation
   */
  logCreation(target: string, data: unknown): void {
    this.logger.log(`🏗️ Creating ${target}: ${JSON.stringify(data)}`);
  }

  /**
   * 记录查询操作日志
   * Log query operation
   */
  logQuery(target: string, params?: unknown): void {
    this.logger.log(
      `🔍 Querying ${target}${params ? `: ${JSON.stringify(params)}` : ''}`,
    );
  }

  /**
   * 记录更新操作日志
   * Log update operation
   */
  logUpdate(target: string, data: unknown): void {
    this.logger.log(`📝 Updating ${target}: ${JSON.stringify(data)}`);
  }

  /**
   * 记录安全相关日志
   * Log security-related events
   */
  logSecurity(event: string, details: unknown): void {
    this.logger.warn(
      `🔒 Security Event - ${event}: ${JSON.stringify(details)}`,
    );
  }

  /**
   * 记录性能相关日志
   * Log performance-related events
   */
  logPerformance(operation: string, duration: number, details?: unknown): void {
    this.logger.log(
      `⚡ Performance - ${operation}: ${duration}ms${details ? ` | ${JSON.stringify(details)}` : ''}`,
    );
  }

  /**
   * 记录数据库操作日志
   * Log database operations
   */
  logDatabase(operation: string, table: string, affected?: number): void {
    this.logger.log(
      `💾 Database ${operation} on ${table}${affected !== undefined ? ` | Affected: ${affected}` : ''}`,
    );
  }
}
