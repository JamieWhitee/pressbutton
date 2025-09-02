/**
 * Enterprise Logging System
 * Provides comprehensive logging capabilities for production applications
 * including structured logging, log levels, operation tracking, and audit trails.
 */

// Define comprehensive log levels for different types of information
export enum LogLevel {
  DEBUG = 0,    // Detailed debugging information
  INFO = 1,     // General informational messages
  WARN = 2,     // Warning messages for potential issues
  ERROR = 3,    // Error messages for failures
  CRITICAL = 4  // Critical system failures requiring immediate attention
}

// Define different categories of operations for better organization
export enum OperationType {
  // User operations
  USER_AUTHENTICATION = 'USER_AUTHENTICATION',
  USER_REGISTRATION = 'USER_REGISTRATION',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_PROFILE_UPDATE = 'USER_PROFILE_UPDATE',

  // Data operations
  DATA_CREATE = 'DATA_CREATE',
  DATA_READ = 'DATA_READ',
  DATA_UPDATE = 'DATA_UPDATE',
  DATA_DELETE = 'DATA_DELETE',

  // API operations
  API_REQUEST = 'API_REQUEST',
  API_RESPONSE = 'API_RESPONSE',
  API_ERROR = 'API_ERROR',

  // Business operations
  BUSINESS_PROCESS = 'BUSINESS_PROCESS',
  BUSINESS_RULE_VALIDATION = 'BUSINESS_RULE_VALIDATION',

  // System operations
  SYSTEM_STARTUP = 'SYSTEM_STARTUP',
  SYSTEM_SHUTDOWN = 'SYSTEM_SHUTDOWN',
  SYSTEM_ERROR = 'SYSTEM_ERROR',

  // Security operations
  SECURITY_ACCESS_GRANTED = 'SECURITY_ACCESS_GRANTED',
  SECURITY_ACCESS_DENIED = 'SECURITY_ACCESS_DENIED',
  SECURITY_SUSPICIOUS_ACTIVITY = 'SECURITY_SUSPICIOUS_ACTIVITY',

  // Performance monitoring
  PERFORMANCE_METRIC = 'PERFORMANCE_METRIC',
  PERFORMANCE_ALERT = 'PERFORMANCE_ALERT',

  // User preferences and configuration
  USER_PREFERENCE = 'USER_PREFERENCE',
  CONFIGURATION = 'CONFIGURATION',

  // UI and rendering operations
  UI_RENDER = 'UI_RENDER',
  UI_INTERACTION = 'UI_INTERACTION',

  // Cache operations
  CACHE_HIT = 'CACHE_HIT',
  CACHE_MISS = 'CACHE_MISS',
  CACHE_INVALIDATE = 'CACHE_INVALIDATE',

  // Validation operations
  VALIDATION_SUCCESS = 'VALIDATION_SUCCESS',
  VALIDATION_FAILURE = 'VALIDATION_FAILURE',

  // File operations
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DOWNLOAD = 'FILE_DOWNLOAD',
  FILE_DELETE = 'FILE_DELETE',

  // Notification operations
  NOTIFICATION_SENT = 'NOTIFICATION_SENT',
  NOTIFICATION_RECEIVED = 'NOTIFICATION_RECEIVED'
}

// Comprehensive log entry interface containing all necessary information
export interface LogEntry {
  id: string;                           // Unique identifier for this log entry
  timestamp: Date;                      // When this log entry was created
  level: LogLevel;                      // Severity level of this log
  message: string;                      // Human-readable log message
  operationType?: OperationType;        // Type of operation being logged
  userId?: string;                      // User who performed the operation
  sessionId?: string;                   // Session context
  requestId?: string;                   // Request tracking ID
  component?: string;                   // Which component/module generated this log
  method?: string;                      // Which method/function generated this log
  duration?: number;                    // How long the operation took (in milliseconds)
  metadata?: Record<string, any>;       // Additional structured data
  tags?: string[];                      // Tags for categorization and filtering
  environment?: string;                 // Environment (development, staging, production)
  userAgent?: string;                   // Browser/client information
  ipAddress?: string;                   // Client IP address
  url?: string;                         // URL where operation occurred
  httpMethod?: string;                  // HTTP method used
  httpStatus?: number;                  // HTTP response status
  errorCode?: string;                   // Application-specific error code
  stackTrace?: string;                  // Stack trace for errors
}

// Configuration for the logging system
interface LoggerConfig {
  minLevel: LogLevel;                   // Minimum log level to actually record
  enableConsoleOutput: boolean;         // Whether to output to browser console
  enableLocalStorage: boolean;          // Whether to store logs in localStorage
  enableRemoteLogging: boolean;         // Whether to send logs to remote server
  maxLocalStorageEntries: number;       // Maximum log entries to keep in localStorage
  remoteEndpoint?: string;              // URL for remote logging service
  batchSize: number;                    // Number of logs to batch before sending
  flushInterval: number;                // How often to flush logs (in milliseconds)
  sensitiveFields: string[];            // Fields to exclude from logging for privacy
}

// Default configuration for different environments
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsoleOutput: process.env.NODE_ENV !== 'production',
  enableLocalStorage: true,
  enableRemoteLogging: process.env.NODE_ENV === 'production',
  maxLocalStorageEntries: 1000,
  ...(process.env['NEXT_PUBLIC_LOGGING_ENDPOINT'] && { remoteEndpoint: process.env['NEXT_PUBLIC_LOGGING_ENDPOINT'] }),
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  sensitiveFields: ['password', 'token', 'creditCard', 'ssn', 'apiKey']
};

/**
 * Enterprise Logger Class
 * Central logging system for the entire application
 */
class EnterpriseLogger {
  private static instance: EnterpriseLogger;
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;
  private sessionId: string;

  // Singleton pattern ensures consistent logging across the application
  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();

    // Set up automatic log flushing for remote logging
    if (this.config.enableRemoteLogging) {
      this.setupAutoFlush();
    }

    // Clean up old localStorage entries if enabled
    if (this.config.enableLocalStorage) {
      this.cleanupLocalStorage();
    }
  }

  public static getInstance(config?: Partial<LoggerConfig>): EnterpriseLogger {
    if (!EnterpriseLogger.instance) {
      EnterpriseLogger.instance = new EnterpriseLogger(config);
    }
    return EnterpriseLogger.instance;
  }

  /**
   * Log a debug message (detailed debugging information)
   */
  public debug(message: string, metadata?: Record<string, any>, operationType?: OperationType): void {
    this.log(LogLevel.DEBUG, message, metadata, operationType);
  }

  /**
   * Log an info message (general informational messages)
   */
  public info(message: string, metadata?: Record<string, any>, operationType?: OperationType): void {
    this.log(LogLevel.INFO, message, metadata, operationType);
  }

  /**
   * Log a warning message (potential issues)
   */
  public warn(message: string, metadata?: Record<string, any>, operationType?: OperationType): void {
    this.log(LogLevel.WARN, message, metadata, operationType);
  }

  /**
   * Log an error message (failures and errors)
   */
  public error(message: string, metadata?: Record<string, any>, operationType?: OperationType): void {
    this.log(LogLevel.ERROR, message, metadata, operationType);
  }

  /**
   * Log a critical message (critical system failures)
   */
  public critical(message: string, metadata?: Record<string, any>, operationType?: OperationType): void {
    this.log(LogLevel.CRITICAL, message, metadata, operationType);
  }

  /**
   * Log the start of an operation (useful for performance tracking)
   */
  public operationStart(operationType: OperationType, message: string, metadata?: Record<string, any>): string {
    const operationId = this.generateOperationId();
    this.info(`Operation Started: ${message}`, {
      ...metadata,
      operationId,
      operationStart: true
    }, operationType);
    return operationId;
  }

  /**
   * Log the completion of an operation with duration tracking
   */
  public operationEnd(
    operationId: string,
    operationType: OperationType,
    message: string,
    success: boolean,
    startTime: number,
    metadata?: Record<string, any>
  ): void {
    const duration = Date.now() - startTime;
    const level = success ? LogLevel.INFO : LogLevel.ERROR;

    this.log(level, `Operation ${success ? 'Completed' : 'Failed'}: ${message}`, {
      ...metadata,
      operationId,
      operationEnd: true,
      success,
      duration
    }, operationType);
  }

  /**
   * Log user actions for audit trail
   */
  public logUserAction(
    userId: string,
    action: string,
    resource?: string,
    metadata?: Record<string, any>
  ): void {
    this.info(`User Action: ${action}`, {
      ...metadata,
      userId,
      resource,
      userAction: true
    }, OperationType.USER_AUTHENTICATION);
  }

  /**
   * Log API requests and responses for debugging and monitoring
   */
  public logApiCall(
    method: string,
    url: string,
    status: number,
    duration: number,
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API Call: ${method} ${url}`, {
      ...metadata,
      httpMethod: method,
      url,
      httpStatus: status,
      duration,
      userId
    }, OperationType.API_REQUEST);
  }

  /**
   * Core logging method that handles all log processing
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    operationType?: OperationType
  ): void {

    // Check if this log level should be recorded
    if (level < this.config.minLevel) {
      return;
    }

    // Create comprehensive log entry
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      message,
      sessionId: this.sessionId,
      environment: process.env.NODE_ENV || 'development',
      ...this.getContextInfo(),
      ...(operationType && { operationType }),
      ...(metadata && { metadata: this.sanitizeMetadata(metadata) })
    };

    // Output to console if enabled (typically for development)
    if (this.config.enableConsoleOutput) {
      this.outputToConsole(logEntry);
    }

    // Store in localStorage if enabled (for offline debugging)
    if (this.config.enableLocalStorage) {
      this.storeInLocalStorage(logEntry);
    }

    // Add to buffer for remote logging if enabled
    if (this.config.enableRemoteLogging) {
      this.addToBuffer(logEntry);
    }
  }

  /**
   * Get contextual information about the current environment
   */
  private getContextInfo(): Partial<LogEntry> {
    const context: Partial<LogEntry> = {};

    // Only gather browser-specific information if in browser environment
    if (typeof window !== 'undefined') {
      context.userAgent = navigator.userAgent;
      context.url = window.location.href;
    }

    return context;
  }

  /**
   * Remove sensitive information from metadata before logging
   */
  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized = { ...metadata };

    // Remove sensitive fields to protect user privacy
    this.config.sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Output log entry to browser console with appropriate formatting
   */
  private outputToConsole(logEntry: LogEntry): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    const colors = ['#888', '#0066cc', '#ff8800', '#ff0000', '#ff0000'];

    const prefix = `[${levelNames[logEntry.level]}] ${logEntry.timestamp.toISOString()}`;
    const style = `color: ${colors[logEntry.level]}; font-weight: bold;`;

    // Use appropriate console method based on log level
    switch (logEntry.level) {
      case LogLevel.DEBUG:
        console.debug(`%c${prefix}`, style, logEntry.message, logEntry.metadata);
        break;
      case LogLevel.INFO:
        console.info(`%c${prefix}`, style, logEntry.message, logEntry.metadata);
        break;
      case LogLevel.WARN:
        console.warn(`%c${prefix}`, style, logEntry.message, logEntry.metadata);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(`%c${prefix}`, style, logEntry.message, logEntry.metadata);
        if (logEntry.stackTrace) {
          console.error('Stack Trace:', logEntry.stackTrace);
        }
        break;
    }
  }

  /**
   * Store log entry in browser's localStorage for offline debugging
   */
  private storeInLocalStorage(logEntry: LogEntry): void {
    if (typeof window === 'undefined') return;

    try {
      const key = 'enterprise_logs';
      const existingLogs = JSON.parse(localStorage.getItem(key) || '[]');

      existingLogs.push(logEntry);

      // Keep only the most recent entries to prevent storage overflow
      if (existingLogs.length > this.config.maxLocalStorageEntries) {
        existingLogs.splice(0, existingLogs.length - this.config.maxLocalStorageEntries);
      }

      localStorage.setItem(key, JSON.stringify(existingLogs));
    } catch (error) {
      // If localStorage is full or unavailable, fail silently
      console.warn('Failed to store log in localStorage:', error);
    }
  }

  /**
   * Add log entry to buffer for batch sending to remote server
   */
  private addToBuffer(logEntry: LogEntry): void {
    this.logBuffer.push(logEntry);

    // Send logs immediately if buffer is full
    if (this.logBuffer.length >= this.config.batchSize) {
      this.flushLogs();
    }
  }

  /**
   * Set up automatic log flushing to remote server
   */
  private setupAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.logBuffer.length > 0) {
        this.flushLogs();
      }
    }, this.config.flushInterval);
  }

  /**
   * Send buffered logs to remote logging service
   */
  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0 || !this.config.remoteEndpoint) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend }),
      });
    } catch (error) {
      // If remote logging fails, add logs back to buffer and try again later
      this.logBuffer.unshift(...logsToSend);
      console.warn('Failed to send logs to remote server:', error);
    }
  }

  /**
   * Clean up old localStorage entries to prevent storage overflow
   */
  private cleanupLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const key = 'enterprise_logs';
      const existingLogs = JSON.parse(localStorage.getItem(key) || '[]');

      if (existingLogs.length > this.config.maxLocalStorageEntries) {
        const cleanedLogs = existingLogs.slice(-this.config.maxLocalStorageEntries);
        localStorage.setItem(key, JSON.stringify(cleanedLogs));
      }
    } catch (error) {
      console.warn('Failed to cleanup localStorage logs:', error);
    }
  }

  /**
   * Generate unique session ID for tracking user sessions
   */
  private generateSessionId(): string {
    return `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique log entry ID
   */
  private generateLogId(): string {
    return `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique operation ID for tracking operations
   */
  private generateOperationId(): string {
    return `OP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get logs from localStorage (useful for debugging)
   */
  public getStoredLogs(): LogEntry[] {
    if (typeof window === 'undefined') return [];

    try {
      return JSON.parse(localStorage.getItem('enterprise_logs') || '[]');
    } catch (error) {
      console.warn('Failed to retrieve stored logs:', error);
      return [];
    }
  }

  /**
   * Clear all stored logs (useful for testing or privacy)
   */
  public clearStoredLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('enterprise_logs');
    }
    this.logBuffer = [];
  }

  /**
   * Update logger configuration at runtime
   */
  public updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart auto-flush timer if configuration changed
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    if (this.config.enableRemoteLogging) {
      this.setupAutoFlush();
    }
  }

  /**
   * Get current logger configuration
   */
  public getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// Export singleton instance for use throughout the application
export const enterpriseLogger = EnterpriseLogger.getInstance();
