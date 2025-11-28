/**
 * Enterprise Context Provider
 * Provides enterprise-level functionality across the entire application
 * including error handling, logging, notifications, and performance monitoring.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { enterpriseLogger, OperationType } from '../lib/logging/enterprise-logger';
import { enterpriseExceptionHandler, ErrorType, ErrorSeverity } from '../lib/exceptions/exception-handler';
import type { EnterpriseError } from '../lib/exceptions/exception-handler';

// Notification types for user feedback
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary';
  }>;
  timestamp: Date;
}

// Performance metrics interface
export interface PerformanceMetrics {
  pageLoadTime: number;
  apiCalls: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
  };
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// Enterprise context interface
interface EnterpriseContextType {
  // Notification management
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  hideNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Error handling
  reportError: (error: Error | string, context?: Record<string, any>) => void;
  getErrorHistory: () => EnterpriseError[];

  // Performance monitoring
  getPerformanceMetrics: () => PerformanceMetrics;
  startPerformanceTracking: (operationName: string) => string;
  endPerformanceTracking: (trackingId: string) => void;

  // Logging
  logUserAction: (action: string, resource?: string, metadata?: Record<string, any>) => void;

  // System health
  isSystemHealthy: boolean;
  lastHealthCheck: Date | null;

  // Feature flags (for enterprise deployments)
  isFeatureEnabled: (featureName: string) => boolean;
}

// Enterprise context
const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

// Enterprise provider props
interface EnterpriseProviderProps {
  children: ReactNode;
  config?: {
    enablePerformanceMonitoring?: boolean;
    enableNotifications?: boolean;
    maxNotifications?: number;
    defaultNotificationDuration?: number;
    featureFlags?: Record<string, boolean>;
  };
}

/**
 * Enterprise Provider Component
 * Wraps the application with enterprise-level functionality
 */
export function EnterpriseProvider({
  children,
  config = {}
}: EnterpriseProviderProps) {

  const {
    enablePerformanceMonitoring = true,
    enableNotifications = true,
    maxNotifications = 5,
    defaultNotificationDuration = 5000,
    featureFlags = {}
  } = config;

  // State management
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSystemHealthy, setIsSystemHealthy] = useState(true);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);
  const [performanceTracking] = useState<Map<string, { name: string; startTime: number }>>(new Map());

  // Initialize enterprise systems on mount
  useEffect(() => {
    enterpriseLogger.info('Enterprise Provider initialized', {
      enablePerformanceMonitoring,
      enableNotifications,
      maxNotifications,
      defaultNotificationDuration,
      featureFlags
    }, OperationType.SYSTEM_STARTUP);

    // Set up global error handler
    const handleGlobalError = (event: ErrorEvent) => {
      reportError(new Error(event.error || event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'global'
      });
    };

    // Set up unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
        type: 'unhandledRejection',
        reason: event.reason
      });
    };

    // Add global error listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Perform initial system health check
    performSystemHealthCheck();

    // Set up periodic health checks (every 5 minutes)
    const healthCheckInterval = setInterval(performSystemHealthCheck, 5 * 60 * 1000);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      clearInterval(healthCheckInterval);
    };
  }, []);

  /**
   * Show notification to user
   */
  const showNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp'>): string => {
    if (!enableNotifications) return '';

    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notification: Notification = {
      id,
      timestamp: new Date(),
      duration: notificationData.duration ?? defaultNotificationDuration,
      ...notificationData
    };

    setNotifications(prev => {
      // Remove oldest notifications if we exceed max
      const updated = prev.length >= maxNotifications
        ? prev.slice(1 - maxNotifications)
        : prev;

      return [...updated, notification];
    });

    // Auto-hide notification if not persistent
    if (!notification.persistent && notification.duration && notification.duration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, notification.duration);
    }

    // Log notification
    enterpriseLogger.info('Notification shown to user', {
      notificationId: id,
      type: notification.type,
      title: notification.title,
      persistent: notification.persistent
    }, OperationType.USER_AUTHENTICATION);

    return id;
  }, [enableNotifications, maxNotifications, defaultNotificationDuration]);

  /**
   * Hide specific notification
   */
  const hideNotification = useCallback((id: string): void => {
    setNotifications(prev => prev.filter(n => n.id !== id));

    enterpriseLogger.debug('Notification hidden', {
      notificationId: id
    });
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback((): void => {
    const count = notifications.length;
    setNotifications([]);

    enterpriseLogger.info('All notifications cleared', {
      clearedCount: count
    });
  }, [notifications.length]);

  /**
   * Report error with enterprise handling
   */
  const reportError = useCallback((error: Error | string, context?: Record<string, any>): void => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    const enterpriseError = enterpriseExceptionHandler.handleError(errorObj, {
      additionalDetails: {
        ...context,
        reportedFromContext: true
      }
    });

    // Show error notification to user
    if (enableNotifications && enterpriseExceptionHandler.shouldNotifyUser(enterpriseError)) {
      const notificationData: Omit<Notification, 'id' | 'timestamp'> = {
        type: NotificationType.ERROR,
        title: 'Error Occurred',
        message: enterpriseError.userMessage,
        persistent: enterpriseError.severity === 'CRITICAL'
      };

      if (enterpriseExceptionHandler.shouldRetry(enterpriseError)) {
        notificationData.actions = [{
          label: 'Retry',
          action: () => window.location.reload(),
          style: 'primary'
        }];
      }

      showNotification(notificationData);
    }
  }, [enableNotifications, showNotification]);

  /**
   * Get error history from enterprise logger
   */
  const getErrorHistory = useCallback((): EnterpriseError[] => {
    const logs = enterpriseLogger.getStoredLogs();
    return logs
      .filter(log => log.level >= 3) // ERROR and CRITICAL levels
      .map(log => {
        const errorData: EnterpriseError = {
          id: log.id,
          type: ErrorType.UNKNOWN_ERROR,
          severity: ErrorSeverity.MEDIUM,
          message: log.message,
          userMessage: log.message,
          timestamp: log.timestamp
        };

        if (log.metadata) {
          errorData.details = log.metadata;
        }

        return errorData;
      });
  }, []);

  /**
   * Get current performance metrics
   */
  const getPerformanceMetrics = useCallback((): PerformanceMetrics => {
    const logs = enterpriseLogger.getStoredLogs();
    const apiLogs = logs.filter(log => log.operationType === OperationType.API_REQUEST);

    const successful = apiLogs.filter(log => log.message.includes('completed successfully')).length;
    const failed = apiLogs.filter(log => log.message.includes('failed')).length;
    const avgResponseTime = apiLogs.reduce((acc, log) => acc + (log.duration || 0), 0) / apiLogs.length || 0;

    const errorLogs = logs.filter(log => log.level >= 3);
    const errorsByType = errorLogs.reduce((acc, log) => {
      const type = log.operationType || 'UNKNOWN';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const metrics: PerformanceMetrics = {
      pageLoadTime: performance.now(),
      apiCalls: {
        total: apiLogs.length,
        successful,
        failed,
        averageResponseTime: avgResponseTime
      },
      errors: {
        total: errorLogs.length,
        byType: errorsByType
      }
    };

    // Add memory usage if available
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      metrics.memoryUsage = {
        usedJSHeapSize: memInfo.usedJSHeapSize,
        totalJSHeapSize: memInfo.totalJSHeapSize,
        jsHeapSizeLimit: memInfo.jsHeapSizeLimit
      };
    }

    return metrics;
  }, []);

  /**
   * Start performance tracking for an operation
   */
  const startPerformanceTracking = useCallback((operationName: string): string => {
    if (!enablePerformanceMonitoring) return '';

    const trackingId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    performanceTracking.set(trackingId, {
      name: operationName,
      startTime: performance.now()
    });

    enterpriseLogger.debug('Performance tracking started', {
      trackingId,
      operationName
    }, OperationType.PERFORMANCE_METRIC);

    return trackingId;
  }, [enablePerformanceMonitoring, performanceTracking]);

  /**
   * End performance tracking and log results
   */
  const endPerformanceTracking = useCallback((trackingId: string): void => {
    const tracking = performanceTracking.get(trackingId);
    if (!tracking) return;

    const duration = performance.now() - tracking.startTime;
    performanceTracking.delete(trackingId);

    enterpriseLogger.info('Performance tracking completed', {
      trackingId,
      operationName: tracking.name,
      duration
    }, OperationType.PERFORMANCE_METRIC);
  }, [performanceTracking]);

  /**
   * Log user action for audit trail
   */
  const logUserAction = useCallback((action: string, resource?: string, metadata?: Record<string, any>): void => {
    enterpriseLogger.logUserAction('unknown', action, resource, metadata);
  }, []);

  /**
   * Check if feature is enabled
   */
  const isFeatureEnabled = useCallback((featureName: string): boolean => {
    return featureFlags[featureName] ?? false;
  }, [featureFlags]);

  /**
   * Perform system health check
   */
  const performSystemHealthCheck = useCallback((): void => {
    try {
      // Check if essential services are working
      const checks = {
        localStorage: checkLocalStorage(),
        performance: checkPerformanceAPI(),
        fetch: checkFetchAPI(),
        memory: checkMemoryUsage()
      };

      const allHealthy = Object.values(checks).every(Boolean);
      setIsSystemHealthy(allHealthy);
      setLastHealthCheck(new Date());

      enterpriseLogger.info('System health check completed', {
        healthy: allHealthy,
        checks,
        timestamp: new Date().toISOString()
      }, OperationType.SYSTEM_STARTUP);

      if (!allHealthy) {
        showNotification({
          type: NotificationType.WARNING,
          title: 'System Health Warning',
          message: 'Some system features may not be working properly.',
          persistent: true
        });
      }

    } catch (error) {
      setIsSystemHealthy(false);
      setLastHealthCheck(new Date());

      enterpriseLogger.error('System health check failed', {
        error: error instanceof Error ? error.message : String(error)
      }, OperationType.SYSTEM_ERROR);
    }
  }, [showNotification]);

  // Health check helper functions
  const checkLocalStorage = (): boolean => {
    try {
      const testKey = '__health_check__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  };

  const checkPerformanceAPI = (): boolean => {
    return typeof performance !== 'undefined' && typeof performance.now === 'function';
  };

  const checkFetchAPI = (): boolean => {
    return typeof fetch === 'function';
  };

  const checkMemoryUsage = (): boolean => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const usageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
      return usageRatio < 0.9; // Warn if using more than 90% of available memory
    }
    return true; // If memory API not available, assume OK
  };

  // Context value
  const value: EnterpriseContextType = {
    notifications,
    showNotification,
    hideNotification,
    clearAllNotifications,
    reportError,
    getErrorHistory,
    getPerformanceMetrics,
    startPerformanceTracking,
    endPerformanceTracking,
    logUserAction,
    isSystemHealthy,
    lastHealthCheck,
    isFeatureEnabled
  };

  return (
    <EnterpriseContext.Provider value={value}>
      {children}
      {/* Render notifications if enabled */}
      {enableNotifications && <NotificationContainer notifications={notifications} onHide={hideNotification} />}
    </EnterpriseContext.Provider>
  );
}

/**
 * Notification Container Component
 * Renders notifications in a fixed position overlay
 */
interface NotificationContainerProps {
  notifications: Notification[];
  onHide: (id: string) => void;
}

function NotificationContainer({ notifications, onHide }: NotificationContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onHide={onHide}
        />
      ))}
    </div>
  );
}

/**
 * Individual Notification Item Component
 */
interface NotificationItemProps {
  notification: Notification;
  onHide: (id: string) => void;
}

function NotificationItem({ notification, onHide }: NotificationItemProps) {
  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'bg-green-50 border-green-200 text-green-800';
      case NotificationType.ERROR:
        return 'bg-red-50 border-red-200 text-red-800';
      case NotificationType.WARNING:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case NotificationType.INFO:
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return '✅';
      case NotificationType.ERROR:
        return '❌';
      case NotificationType.WARNING:
        return '⚠️';
      case NotificationType.INFO:
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`p-4 rounded-lg border shadow-lg ${getTypeStyles(notification.type)} animate-slide-in`}>
      <div className="flex items-start">
        <span className="text-lg mr-3">{getIcon(notification.type)}</span>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{notification.title}</h4>
          <p className="text-sm mt-1 opacity-90">{notification.message}</p>

          {/* Action buttons */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`px-3 py-1 text-xs rounded ${
                    action.style === 'primary'
                      ? 'bg-current text-white opacity-90 hover:opacity-100'
                      : 'bg-transparent border border-current opacity-70 hover:opacity-90'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        {!notification.persistent && (
          <button
            onClick={() => onHide(notification.id)}
            className="ml-2 text-lg opacity-50 hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Hook to use Enterprise context
 */
export function useEnterprise(): EnterpriseContextType {
  const context = useContext(EnterpriseContext);
  if (context === undefined) {
    throw new Error('useEnterprise must be used within an EnterpriseProvider');
  }
  return context;
}
