/**
 * Enterprise-level Exception Handling System
 * Provides centralized error management with detailed error categorization,
 * user-friendly messages, and comprehensive error tracking for production systems.
 */

import { enterpriseLogger } from '../logging/enterprise-logger';

// Define comprehensive error types that can occur in enterprise applications
export enum ErrorType {
  // Network and API related errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',

  // Data validation and processing errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATA_PROCESSING_ERROR = 'DATA_PROCESSING_ERROR',

  // System and infrastructure errors
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // Business logic errors
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // External service errors
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Define error severity levels for proper escalation and monitoring
export enum ErrorSeverity {
  LOW = 'LOW',           // Minor issues, user can continue
  MEDIUM = 'MEDIUM',     // Affects user experience but not critical
  HIGH = 'HIGH',         // Significant impact on functionality
  CRITICAL = 'CRITICAL'  // System-breaking issues requiring immediate attention
}

// Comprehensive error interface containing all necessary information for debugging and user feedback
export interface EnterpriseError {
  id: string;                    // Unique identifier for tracking
  type: ErrorType;               // Categorized error type
  severity: ErrorSeverity;       // How critical this error is
  message: string;               // Technical error message
  userMessage: string;           // User-friendly message to display
  details?: Record<string, any>; // Additional context and debugging information
  timestamp: Date;               // When the error occurred
  userId?: string;               // Which user experienced this error
  sessionId?: string;            // Session context for debugging
  stackTrace?: string;           // Technical stack trace for debugging
  httpStatus?: number;           // HTTP status code if applicable
  endpoint?: string;             // API endpoint where error occurred
  requestId?: string;            // Request tracking ID
}

// Configuration for different error types and their default handling
interface ErrorTypeConfig {
  severity: ErrorSeverity;
  userMessage: string;
  shouldLog: boolean;           // Whether to log this error type
  shouldNotifyUser: boolean;    // Whether to show notification to user
  shouldRetry: boolean;         // Whether automatic retry is appropriate
}

// Pre-configured error handling rules for different error types
const ERROR_TYPE_CONFIGS: Record<ErrorType, ErrorTypeConfig> = {
  [ErrorType.NETWORK_ERROR]: {
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Network connection problem. Please check your internet connection and try again.',
    shouldLog: true,
    shouldNotifyUser: true,
    shouldRetry: true
  },
  [ErrorType.API_ERROR]: {
    severity: ErrorSeverity.HIGH,
    userMessage: 'Server error occurred. Our team has been notified.',
    shouldLog: true,
    shouldNotifyUser: true,
    shouldRetry: false
  },
  [ErrorType.AUTHENTICATION_ERROR]: {
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Authentication failed. Please log in again.',
    shouldLog: true,
    shouldNotifyUser: true,
    shouldRetry: false
  },
  [ErrorType.AUTHORIZATION_ERROR]: {
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'You do not have permission to perform this action.',
    shouldLog: true,
    shouldNotifyUser: true,
    shouldRetry: false
  },
  [ErrorType.VALIDATION_ERROR]: {
    severity: ErrorSeverity.LOW,
    userMessage: 'Please check your input and try again.',
    shouldLog: false,
    shouldNotifyUser: true,
    shouldRetry: false
  },
  [ErrorType.DATA_PROCESSING_ERROR]: {
    severity: ErrorSeverity.HIGH,
    userMessage: 'Error processing your request. Please try again.',
    shouldLog: true,
    shouldNotifyUser: true,
    shouldRetry: true
  },
  [ErrorType.SYSTEM_ERROR]: {
    severity: ErrorSeverity.CRITICAL,
    userMessage: 'System error occurred. Please contact support if this persists.',
    shouldLog: true,
    shouldNotifyUser: true,
    shouldRetry: false
  },
  [ErrorType.TIMEOUT_ERROR]: {
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Request timed out. Please try again.',
    shouldLog: true,
    shouldNotifyUser: true,
    shouldRetry: true
  },
  [ErrorType.BUSINESS_LOGIC_ERROR]: {
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Business rule validation failed.',
    shouldLog: true,
    shouldNotifyUser: true,
    shouldRetry: false
  },
  [ErrorType.RESOURCE_NOT_FOUND]: {
    severity: ErrorSeverity.LOW,
    userMessage: 'The requested resource was not found.',
    shouldLog: false,
    shouldNotifyUser: true,
    shouldRetry: false
  },
  [ErrorType.EXTERNAL_SERVICE_ERROR]: {
    severity: ErrorSeverity.HIGH,
    userMessage: 'External service is temporarily unavailable.',
    shouldLog: true,
    shouldNotifyUser: true,
    shouldRetry: true
  },
  [ErrorType.UNKNOWN_ERROR]: {
    severity: ErrorSeverity.HIGH,
    userMessage: 'An unexpected error occurred. Please try again.',
    shouldLog: true,
    shouldNotifyUser: true,
    shouldRetry: false
  }
};

/**
 * Enterprise Exception Handler Class
 * Central hub for all error processing in the application
 */
class EnterpriseExceptionHandler {
  private static instance: EnterpriseExceptionHandler;
  private errorCallbacks: ((error: EnterpriseError) => void)[] = [];

  // Singleton pattern ensures consistent error handling across the application
  public static getInstance(): EnterpriseExceptionHandler {
    if (!EnterpriseExceptionHandler.instance) {
      EnterpriseExceptionHandler.instance = new EnterpriseExceptionHandler();
    }
    return EnterpriseExceptionHandler.instance;
  }

  /**
   * Register callback functions to be executed when errors occur
   * Useful for custom error handling, analytics, or notifications
   */
  public onError(callback: (error: EnterpriseError) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Main error handling method that processes any error and converts it to EnterpriseError
   * @param error - Any error object or string
   * @param context - Additional context information
   * @returns Processed EnterpriseError object
   */
  public handleError(error: any, context?: {
    userId?: string;
    sessionId?: string;
    endpoint?: string;
    requestId?: string;
    additionalDetails?: Record<string, any>;
  }): EnterpriseError {

    // Convert any error type to standardized EnterpriseError format
    const enterpriseError = this.createEnterpriseError(error, context);

    // Get configuration for this error type
    const config = ERROR_TYPE_CONFIGS[enterpriseError.type];

    // Log error if configuration specifies it should be logged
    if (config.shouldLog) {
      this.logError(enterpriseError);
    }

    // Execute all registered error callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(enterpriseError);
      } catch (callbackError) {
        // Prevent callback errors from breaking the error handling process
        console.error('Error in error callback:', callbackError);
      }
    });

    return enterpriseError;
  }

  /**
   * Convert any error to standardized EnterpriseError format
   * Handles various error types: Error objects, HTTP responses, strings, etc.
   */
  private createEnterpriseError(error: any, context?: {
    userId?: string;
    sessionId?: string;
    endpoint?: string;
    requestId?: string;
    additionalDetails?: Record<string, any>;
  }): EnterpriseError {

    const errorId = this.generateErrorId();
    const timestamp = new Date();

    // Handle different types of errors appropriately
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network connectivity issues
      return {
        id: errorId,
        type: ErrorType.NETWORK_ERROR,
        severity: ErrorSeverity.MEDIUM,
        message: error.message,
        userMessage: ERROR_TYPE_CONFIGS[ErrorType.NETWORK_ERROR].userMessage,
        timestamp,
        ...(error.stack && { stackTrace: error.stack }),
        ...context
      };
    }

    if (error?.status || error?.httpStatus) {
      // HTTP errors from API responses
      const status = error.status || error.httpStatus;
      return this.handleHttpError(errorId, status, error, timestamp, context);
    }

    if (error instanceof Error) {
      // Standard JavaScript Error objects
      return {
        id: errorId,
        type: this.determineErrorType(error),
        severity: ErrorSeverity.MEDIUM,
        message: error.message,
        userMessage: this.getUserMessage(error),
        timestamp,
        ...(error.stack && { stackTrace: error.stack }),
        ...context
      };
    }

    if (typeof error === 'string') {
      // String error messages
      return {
        id: errorId,
        type: ErrorType.UNKNOWN_ERROR,
        severity: ErrorSeverity.LOW,
        message: error,
        userMessage: ERROR_TYPE_CONFIGS[ErrorType.UNKNOWN_ERROR].userMessage,
        timestamp,
        ...context
      };
    }

    // Handle unknown error types
    return {
      id: errorId,
      type: ErrorType.UNKNOWN_ERROR,
      severity: ErrorSeverity.HIGH,
      message: JSON.stringify(error),
      userMessage: ERROR_TYPE_CONFIGS[ErrorType.UNKNOWN_ERROR].userMessage,
      timestamp,
      details: { originalError: error },
      ...context
    };
  }

  /**
   * Handle HTTP status code errors with appropriate categorization
   */
  private handleHttpError(
    errorId: string,
    status: number,
    error: any,
    timestamp: Date,
    context?: any
  ): EnterpriseError {

    let type: ErrorType;
    let severity: ErrorSeverity;

    // Categorize HTTP errors by status code ranges
    if (status === 401) {
      type = ErrorType.AUTHENTICATION_ERROR;
      severity = ErrorSeverity.MEDIUM;
    } else if (status === 403) {
      type = ErrorType.AUTHORIZATION_ERROR;
      severity = ErrorSeverity.MEDIUM;
    } else if (status === 404) {
      type = ErrorType.RESOURCE_NOT_FOUND;
      severity = ErrorSeverity.LOW;
    } else if (status >= 400 && status < 500) {
      type = ErrorType.VALIDATION_ERROR;
      severity = ErrorSeverity.LOW;
    } else if (status >= 500) {
      type = ErrorType.API_ERROR;
      severity = ErrorSeverity.HIGH;
    } else {
      type = ErrorType.UNKNOWN_ERROR;
      severity = ErrorSeverity.MEDIUM;
    }

    return {
      id: errorId,
      type,
      severity,
      message: error.message || `HTTP ${status} Error`,
      userMessage: ERROR_TYPE_CONFIGS[type].userMessage,
      httpStatus: status,
      timestamp,
      details: error.details || error.data,
      ...context
    };
  }

  /**
   * Determine error type based on error characteristics
   */
  private determineErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK_ERROR;
    }
    if (message.includes('timeout')) {
      return ErrorType.TIMEOUT_ERROR;
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION_ERROR;
    }
    if (message.includes('auth')) {
      return ErrorType.AUTHENTICATION_ERROR;
    }

    return ErrorType.UNKNOWN_ERROR;
  }

  /**
   * Get user-friendly message based on error type
   */
  private getUserMessage(error: Error): string {
    const errorType = this.determineErrorType(error);
    return ERROR_TYPE_CONFIGS[errorType].userMessage;
  }

  /**
   * Log error using enterprise logging system
   */
  private logError(error: EnterpriseError): void {
    enterpriseLogger.error('Enterprise Error Occurred', {
      errorId: error.id,
      errorType: error.type,
      severity: error.severity,
      message: error.message,
      userMessage: error.userMessage,
      httpStatus: error.httpStatus,
      endpoint: error.endpoint,
      userId: error.userId,
      sessionId: error.sessionId,
      requestId: error.requestId,
      timestamp: error.timestamp,
      stackTrace: error.stackTrace,
      details: error.details
    });
  }

  /**
   * Generate unique error ID for tracking
   */
  private generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if error should trigger retry logic
   */
  public shouldRetry(error: EnterpriseError): boolean {
    return ERROR_TYPE_CONFIGS[error.type].shouldRetry;
  }

  /**
   * Check if error should be displayed to user
   */
  public shouldNotifyUser(error: EnterpriseError): boolean {
    return ERROR_TYPE_CONFIGS[error.type].shouldNotifyUser;
  }
}

// Export singleton instance for use throughout the application
export const enterpriseExceptionHandler = EnterpriseExceptionHandler.getInstance();
