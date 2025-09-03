/**
 * Enhanced API Client with Enterprise Features
 * This file provides a bridge between the old simple API client and the new enterprise system
 * while maintaining backward compatibility for existing code.
 */

import { enterpriseApiClient, type ApiResponse } from './api/enterprise-api-client';
import { enterpriseLogger, OperationType } from './logging/enterprise-logger';
import { enterpriseExceptionHandler } from './exceptions/exception-handler';

// Environment variable (fixed syntax for Next.js)
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001/api';

// Request interfaces (what frontend sends to backend)
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;  // Optional field
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Response interfaces (what backend sends to frontend)
export interface User {
  id: number;
  email: string;
  name?: string;
  createdAt: string;  // Backend sends Date, frontend receives string
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  guestCredentials?: {
    email: string;
    password: string;
  };
}

/**
 * Enhanced API Client Class with Enterprise Features
 * Provides backward compatibility while adding enterprise capabilities
 */
class EnhancedApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;

    // Configure the enterprise client
    enterpriseApiClient.updateConfig({
      baseURL: this.baseURL,
      enableLogging: true,
      enableMetrics: true
    });

    enterpriseLogger.info('Enhanced API Client initialized', {
      baseURL: this.baseURL,
      timestamp: new Date().toISOString()
    }, OperationType.SYSTEM_STARTUP);
  }

  /**
   * Set authentication token (maintains backward compatibility)
   */
  setToken(token: string | null): void {
    if (token) {
      // Store token in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
      }

      enterpriseLogger.logUserAction(
        'unknown', // We don't have userId here, could be enhanced
        'Token Set',
        'Authentication',
        { hasToken: !!token }
      );
    } else {
      // Remove token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }

      enterpriseLogger.logUserAction(
        'unknown',
        'Token Cleared',
        'Authentication'
      );
    }
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Enhanced request method with enterprise error handling
   * Handles both wrapped ApiResponse format and direct backend responses
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const operationId = enterpriseLogger.operationStart(
      OperationType.API_REQUEST,
      `API Call: ${options.method || 'GET'} ${endpoint}`
    );

    const startTime = Date.now();

    try {
      // Make direct fetch request (bypass enterprise client for compatibility)
      const fullUrl = `${this.baseURL}${endpoint}`;
      const requestOptions: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      // Add auth token if available
      const token = this.getToken();
      if (token) {
        (requestOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(fullUrl, requestOptions);

      // Check if response is ok
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default error message
        }

        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
      }

      // Parse response as JSON
      const responseData = await response.json();

      enterpriseLogger.operationEnd(
        operationId,
        OperationType.API_REQUEST,
        `API Call completed successfully`,
        true,
        startTime,
        {
          endpoint,
          method: options.method || 'GET',
          responseSize: JSON.stringify(responseData).length,
          status: response.status
        }
      );

      return responseData as T;

    } catch (error) {
      // Use enterprise exception handling
      const enterpriseError = enterpriseExceptionHandler.handleError(error, {
        endpoint,
        additionalDetails: {
          method: options.method || 'GET',
          duration: Date.now() - startTime
        }
      });

      enterpriseLogger.operationEnd(
        operationId,
        OperationType.API_REQUEST,
        `API Call failed: ${enterpriseError.message}`,
        false,
        startTime,
        {
          errorId: enterpriseError.id,
          errorType: enterpriseError.type,
          endpoint
        }
      );

      // Throw user-friendly error message for backward compatibility
      throw new Error(enterpriseError.userMessage);
    }
  }

  /**
   * User registration with enhanced logging
   */
  async register(data: RegisterRequest): Promise<User> {
    enterpriseLogger.info('User registration attempt started', {
      email: data.email,
      hasName: !!data.name
    }, OperationType.USER_REGISTRATION);

    try {
      const user = await this.request<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      enterpriseLogger.info('User registration completed successfully', {
        userId: user.id,
        email: user.email
      }, OperationType.USER_REGISTRATION);

      return user;

    } catch (error) {
      enterpriseLogger.error('User registration failed', {
        email: data.email,
        error: error instanceof Error ? error.message : String(error)
      }, OperationType.USER_REGISTRATION);

      throw error;
    }
  }

  /**
   * User login with enhanced logging and token management
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    enterpriseLogger.info('User login attempt started', {
      email: data.email
    }, OperationType.USER_AUTHENTICATION);

    try {
      const response = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Automatically store token using enterprise token management
      this.setToken(response.access_token);

      enterpriseLogger.info('User login completed successfully', {
        userId: response.user.id,
        email: response.user.email,
        tokenType: response.token_type
      }, OperationType.USER_AUTHENTICATION);

      // Log user action for audit trail
      enterpriseLogger.logUserAction(
        String(response.user.id),
        'Login',
        'Authentication',
        {
          email: response.user.email,
          loginTime: new Date().toISOString()
        }
      );

      return response;

    } catch (error) {
      enterpriseLogger.error('User login failed', {
        email: data.email,
        error: error instanceof Error ? error.message : String(error)
      }, OperationType.USER_AUTHENTICATION);

      throw error;
    }
  }

  /**
   * Create guest account for quick voting access
   * This allows users to vote without going through the full registration process
   */
  async createGuestAccount(): Promise<AuthResponse> {
    enterpriseLogger.info('Guest account creation started', {}, OperationType.USER_REGISTRATION);

    try {
      const response = await this.request<AuthResponse>('/auth/guest-signup', {
        method: 'POST',
      });

      // Automatically store token for immediate login
      this.setToken(response.access_token);

      enterpriseLogger.info('Guest account created successfully', {
        userId: response.user.id,
        email: response.user.email,
        tokenType: response.token_type,
        isGuest: true
      }, OperationType.USER_REGISTRATION);

      // Log user action for audit trail
      enterpriseLogger.logUserAction(
        String(response.user.id),
        'Guest Account Created',
        'Authentication',
        {
          email: response.user.email,
          createTime: new Date().toISOString(),
          accountType: 'guest'
        }
      );

      return response;

    } catch (error) {
      enterpriseLogger.error('Guest account creation failed', {
        error: error instanceof Error ? error.message : String(error)
      }, OperationType.USER_REGISTRATION);

      throw error;
    }
  }

  /**
   * Get user profile with enhanced error handling
   */
  async getProfile(): Promise<User> {
    enterpriseLogger.info('Fetching user profile', {}, OperationType.DATA_READ);

    try {
      const user = await this.request<User>('/auth/profile', {
        method: 'GET',
      });

      enterpriseLogger.info('User profile fetched successfully', {
        userId: user.id,
        email: user.email
      }, OperationType.DATA_READ);

      return user;

    } catch (error) {
      enterpriseLogger.error('Failed to fetch user profile', {
        error: error instanceof Error ? error.message : String(error)
      }, OperationType.DATA_READ);

      throw error;
    }
  }

  /**
   * User logout with enhanced logging
   */
  logout(): void {
    const hadToken = !!this.getToken();

    enterpriseLogger.info('User logout initiated', {
      hadToken
    }, OperationType.USER_LOGOUT);

    // Clear tokens using our token management
    this.setToken(null);

    enterpriseLogger.info('User logout completed', {}, OperationType.USER_LOGOUT);
  }

  /**
   * Get API client performance metrics
   */
  getMetrics(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  } {
    // This is a placeholder - in a real implementation, you'd track these metrics
    const logs = enterpriseLogger.getStoredLogs();
    const apiLogs = logs.filter(log => log.operationType === OperationType.API_REQUEST);

    return {
      totalRequests: apiLogs.length,
      successfulRequests: apiLogs.filter(log => log.message.includes('completed successfully')).length,
      failedRequests: apiLogs.filter(log => log.message.includes('failed')).length,
      averageResponseTime: apiLogs.reduce((acc, log) => acc + (log.duration || 0), 0) / apiLogs.length || 0
    };
  }

  /**
   * Clear all cached data and logs (useful for testing or privacy)
   */
  clearCache(): void {
    enterpriseLogger.clearStoredLogs();
    enterpriseLogger.info('API client cache cleared', {}, OperationType.SYSTEM_STARTUP);
  }
}

// Create and export singleton instance
export const apiClient = new EnhancedApiClient(API_BASE_URL);

// Export enterprise client for advanced use cases
export { enterpriseApiClient };

// Export enterprise logging and error handling for components that need it
export { enterpriseLogger, enterpriseExceptionHandler };
