/**
 * Enterprise Unified API Design System
 * Provides consistent API communication patterns across the entire application
 * with standardized request/response formats, error handling, and logging.
 */

import { enterpriseLogger, OperationType } from '../logging/enterprise-logger';
import { enterpriseExceptionHandler } from '../exceptions/exception-handler';
import type { EnterpriseError } from '../exceptions/exception-handler';

// Standardized API response wrapper for all endpoints
export interface ApiResponse<T = any> {
  success: boolean;                    // Whether the request was successful
  data?: T;                           // Response data (if successful)
  error?: {                           // Error information (if failed)
    code: string;                     // Error code for programmatic handling
    message: string;                  // Human-readable error message
    details?: Record<string, any>;    // Additional error context
    timestamp: string;                // When the error occurred
    requestId?: string;               // Request tracking ID
  };
  metadata?: {                        // Additional response metadata
    requestId: string;                // Unique request identifier
    timestamp: string;                // Response timestamp
    version: string;                  // API version
    duration: number;                 // Request processing time (ms)
    rateLimit?: {                     // Rate limiting information
      limit: number;                  // Request limit per window
      remaining: number;              // Remaining requests
      resetTime: string;              // When the rate limit resets
    };
    pagination?: {                    // Pagination metadata (for list responses)
      page: number;                   // Current page
      limit: number;                  // Items per page
      total: number;                  // Total items
      hasNext: boolean;               // Whether there are more pages
      hasPrevious: boolean;           // Whether there are previous pages
    };
  };
}

// Standard request configuration interface
export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;   // Custom headers
  params?: Record<string, any>;       // URL query parameters
  data?: any;                         // Request body data
  timeout?: number;                   // Request timeout in milliseconds
  retries?: number;                   // Number of retry attempts
  retryDelay?: number;                // Delay between retries in milliseconds
  validateStatus?: (status: number) => boolean; // Custom status validation
  transformRequest?: (data: any) => any;       // Transform request data
  transformResponse?: (data: any) => any;      // Transform response data
  metadata?: Record<string, any>;     // Additional request metadata
}

// Authentication token management
interface AuthTokens {
  accessToken?: string;               // JWT access token
  refreshToken?: string;              // Refresh token for token renewal
  tokenType?: string;                 // Token type (usually 'Bearer')
  expiresAt?: Date;                   // When the access token expires
}

// Request/Response interceptor interfaces
export interface RequestInterceptor {
  (config: ApiRequestConfig): ApiRequestConfig | Promise<ApiRequestConfig>;
}

export interface ResponseInterceptor {
  (response: ApiResponse): ApiResponse | Promise<ApiResponse>;
}

// API client configuration
interface ApiClientConfig {
  baseURL: string;                    // Base URL for all requests
  timeout: number;                    // Default timeout for requests
  retries: number;                    // Default number of retries
  retryDelay: number;                 // Default delay between retries
  apiVersion: string;                 // API version to use
  enableLogging: boolean;             // Whether to log API calls
  enableMetrics: boolean;             // Whether to collect performance metrics
  authTokens?: AuthTokens;            // Authentication tokens
}

/**
 * Enterprise API Client
 * Centralized HTTP client with enterprise features
 */
export class EnterpriseApiClient {
  private config: ApiClientConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private authTokens: AuthTokens = {};

  constructor(config: Partial<ApiClientConfig>) {
    this.config = {
      baseURL: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001/api',
      timeout: 30000, // 30 seconds
      retries: 3,
      retryDelay: 1000, // 1 second
      apiVersion: 'v1',
      enableLogging: true,
      enableMetrics: true,
      ...config
    };

    // Load tokens from localStorage if available
    this.loadTokensFromStorage();
  }

  /**
   * Add request interceptor (executed before sending request)
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor (executed after receiving response)
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Set authentication tokens
   */
  setAuthTokens(tokens: AuthTokens): void {
    this.authTokens = tokens;
    this.saveTokensToStorage();

    if (this.config.enableLogging) {
      enterpriseLogger.info('Authentication tokens updated', {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        tokenType: tokens.tokenType,
        expiresAt: tokens.expiresAt
      }, OperationType.USER_AUTHENTICATION);
    }
  }

  /**
   * Get current authentication tokens
   */
  getAuthTokens(): AuthTokens {
    return { ...this.authTokens };
  }

  /**
   * Clear authentication tokens
   */
  clearAuthTokens(): void {
    this.authTokens = {};
    this.clearTokensFromStorage();

    if (this.config.enableLogging) {
      enterpriseLogger.info('Authentication tokens cleared', {}, OperationType.USER_LOGOUT);
    }
  }

  /**
   * Check if access token is expired
   */
  isTokenExpired(): boolean {
    if (!this.authTokens.expiresAt) return false;
    return new Date() >= this.authTokens.expiresAt;
  }

  /**
   * Make HTTP request with enterprise features
   */
  async request<T = any>(endpoint: string, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // Merge with default config
    const finalConfig: ApiRequestConfig = {
      method: 'GET',
      timeout: this.config.timeout,
      retries: this.config.retries,
      retryDelay: this.config.retryDelay,
      ...config,
      metadata: {
        requestId,
        startTime,
        ...config.metadata
      }
    };

    // Log request start
    if (this.config.enableLogging) {
      enterpriseLogger.info(`API Request Started: ${finalConfig.method} ${endpoint}`, {
        requestId,
        method: finalConfig.method,
        endpoint,
        hasAuth: !!this.authTokens.accessToken,
        timeout: finalConfig.timeout
      }, OperationType.API_REQUEST);
    }

    try {
      // Apply request interceptors
      for (const interceptor of this.requestInterceptors) {
        await interceptor(finalConfig);
      }

      // Execute request with retry logic
      const response = await this.executeWithRetry<T>(endpoint, finalConfig);

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        await interceptor(response);
      }

      // Log successful response
      if (this.config.enableLogging) {
        const duration = Date.now() - startTime;
        enterpriseLogger.info(`API Request Completed: ${finalConfig.method} ${endpoint}`, {
          requestId,
          success: response.success,
          duration,
          statusCode: response.success ? 200 : (response.error?.code || 'unknown')
        }, OperationType.API_RESPONSE);
      }

      return response;

    } catch (error) {
      // Handle and log errors
      const duration = Date.now() - startTime;
      const enterpriseError = enterpriseExceptionHandler.handleError(error, {
        requestId,
        endpoint,
        additionalDetails: {
          method: finalConfig.method,
          duration,
          retries: finalConfig.retries
        }
      });

      if (this.config.enableLogging) {
        enterpriseLogger.error(`API Request Failed: ${finalConfig.method} ${endpoint}`, {
          requestId,
          errorId: enterpriseError.id,
          errorType: enterpriseError.type,
          duration,
          retries: finalConfig.retries
        }, OperationType.API_ERROR);
      }

      // Return standardized error response
      return {
        success: false,
        error: {
          code: enterpriseError.type,
          message: enterpriseError.userMessage,
          ...(enterpriseError.details && { details: enterpriseError.details }),
          timestamp: enterpriseError.timestamp.toISOString(),
          requestId
        },
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          version: this.config.apiVersion,
          duration: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(endpoint: string, config: ApiRequestConfig): Promise<ApiResponse<T>> {
    let lastError: Error | null = null;
    const maxRetries = config.retries || 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Wait before retry
          await this.delay(config.retryDelay || 1000);

          if (this.config.enableLogging) {
            enterpriseLogger.warn(`API Request Retry Attempt ${attempt}/${maxRetries}: ${config.method} ${endpoint}`, {
              requestId: config.metadata?.['requestId'],
              attempt,
              maxRetries
            });
          }
        }

        return await this.executeRequest<T>(endpoint, config);

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on authentication errors or client errors (4xx)
        if (this.shouldNotRetry(error)) {
          break;
        }
      }
    }

    throw lastError;
  }

  /**
   * Execute single HTTP request
   */
  private async executeRequest<T>(endpoint: string, config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, config.params);
    const requestConfig = this.buildRequestConfig(config);

    // Check if token refresh is needed
    if (this.isTokenExpired() && this.authTokens.refreshToken) {
      await this.refreshAccessToken();
    }

    const response = await fetch(url, requestConfig);
    const responseData = await response.json().catch(() => ({}));

    // Handle non-2xx responses
    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        message: responseData.message || `HTTP ${response.status} Error`
      };
    }

    // Return standardized response format
    return {
      success: true,
      data: responseData,
      metadata: {
        requestId: config.metadata?.['requestId'] || '',
        timestamp: new Date().toISOString(),
        version: this.config.apiVersion,
        duration: Date.now() - (config.metadata?.['startTime'] || Date.now())
      }
    };
  }

  /**
   * Build complete URL with parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const baseUrl = `${this.config.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    return `${baseUrl}?${searchParams.toString()}`;
  }

  /**
   * Build fetch request configuration
   */
  private buildRequestConfig(config: ApiRequestConfig): RequestInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-API-Version': this.config.apiVersion,
      'X-Request-ID': config.metadata?.['requestId'] || '',
      ...config.headers
    };

    // Add authentication header if token exists
    if (this.authTokens.accessToken) {
      const tokenType = this.authTokens.tokenType || 'Bearer';
      headers['Authorization'] = `${tokenType} ${this.authTokens.accessToken}`;
      console.log('🔐 Auth token added to request:', {
        hasToken: true,
        tokenType,
        tokenPreview: this.authTokens.accessToken.substring(0, 20) + '...'
      });
    } else {
      console.warn('⚠️ No auth token available for request');
    }

    const requestConfig: RequestInit = {
      method: config.method || 'GET',
      headers,
      signal: AbortSignal.timeout(config.timeout || this.config.timeout)
    };

    // Add body for non-GET requests
    if (config.data && config.method !== 'GET') {
      if (config.transformRequest) {
        requestConfig.body = config.transformRequest(config.data);
      } else {
        requestConfig.body = JSON.stringify(config.data);
      }
    }

    return requestConfig;
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.authTokens.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.config.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': this.config.apiVersion
        },
        body: JSON.stringify({
          refreshToken: this.authTokens.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newTokens: Partial<AuthTokens> = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || this.authTokens.refreshToken,
        tokenType: data.tokenType || this.authTokens.tokenType
      };

      if (data.expiresAt) {
        newTokens.expiresAt = new Date(data.expiresAt);
      }

      this.setAuthTokens(newTokens as AuthTokens);

    } catch (error) {
      // Clear invalid tokens
      this.clearAuthTokens();
      throw error;
    }
  }

  /**
   * Determine if request should not be retried
   */
  private shouldNotRetry(error: any): boolean {
    const status = error?.status;

    // Don't retry on client errors (4xx) except for specific cases
    if (status >= 400 && status < 500) {
      // Retry on specific 4xx errors that might be temporary
      return ![408, 429].includes(status); // Timeout, Rate Limited
    }

    return false;
  }

  /**
   * Delay execution for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save authentication tokens to localStorage
   */
  private saveTokensToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // Store access token with the same key used by login
      if (this.authTokens.accessToken) {
        localStorage.setItem('auth_token', this.authTokens.accessToken);
      }
      // Also store full token object for compatibility
      localStorage.setItem('enterprise_auth_tokens', JSON.stringify({
        ...this.authTokens,
        expiresAt: this.authTokens.expiresAt?.toISOString()
      }));
    } catch (error) {
      if (this.config.enableLogging) {
        enterpriseLogger.warn('Failed to save tokens to localStorage', { error });
      }
    }
  }

  /**
   * Load authentication tokens from localStorage
   */
  private loadTokensFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // First try to load from auth_token (used by login)
      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        this.authTokens = {
          accessToken: authToken,
          tokenType: 'Bearer'
        };
      }

      // Then try to load full token object
      const stored = localStorage.getItem('enterprise_auth_tokens');
      if (stored) {
        const tokens = JSON.parse(stored);
        this.authTokens = {
          ...this.authTokens, // Keep auth_token if it exists
          ...tokens,
          expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt) : undefined
        };
      }
    } catch (error) {
      if (this.config.enableLogging) {
        enterpriseLogger.warn('Failed to load tokens from localStorage', { error });
      }
    }
  }

  /**
   * Clear authentication tokens from localStorage
   */
  private clearTokensFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('enterprise_auth_tokens');
    } catch (error) {
      if (this.config.enableLogging) {
        enterpriseLogger.warn('Failed to clear tokens from localStorage', { error });
      }
    }
  }

  // Convenience methods for common HTTP operations

  /**
   * Perform GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>, config?: Omit<ApiRequestConfig, 'method' | 'params'>): Promise<ApiResponse<T>> {
    const requestConfig: ApiRequestConfig = { ...config, method: 'GET' };
    if (params) {
      requestConfig.params = params;
    }
    return this.request<T>(endpoint, requestConfig);
  }

  /**
   * Perform POST request
   */
  async post<T>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', data });
  }

  /**
   * Perform PUT request
   */
  async put<T>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', data });
  }

  /**
   * Perform PATCH request
   */
  async patch<T>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', data });
  }

  /**
   * Perform DELETE request
   */
  async delete<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Get client configuration
   */
  getConfig(): ApiClientConfig {
    return { ...this.config };
  }

  /**
   * Update client configuration
   */
  updateConfig(newConfig: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create and export singleton instance
export const enterpriseApiClient = new EnterpriseApiClient({});

// Set up default request interceptor for common headers
enterpriseApiClient.addRequestInterceptor((config) => {
  // Add timestamp to all requests
  config.headers = {
    ...config.headers,
    'X-Timestamp': new Date().toISOString()
  };

  // Add user agent if in browser
  if (typeof window !== 'undefined') {
    config.headers['X-User-Agent'] = navigator.userAgent;
  }

  return config;
});

// Set up default response interceptor for error handling
enterpriseApiClient.addResponseInterceptor((response) => {
  // Log response metrics if enabled
  if (response.metadata?.duration) {
    enterpriseLogger.info('API Response Metrics', {
      requestId: response.metadata.requestId,
      duration: response.metadata.duration,
      success: response.success
    }, OperationType.PERFORMANCE_METRIC);
  }

  return response;
});
