/**
 * 🚀 统一API客户端
 *
 * 功能特性：
 * - 自动环境检测和URL配置
 * - 统一错误处理
 * - 自动JWT令牌管理
 * - 请求/响应日志记录
 * - TypeScript类型安全
 */

import { API_BASE_URL, API_ENDPOINTS, ENV_INFO } from './config';

/**
 * HTTP请求选项接口
 */
interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * API响应接口
 */
interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

/**
 * 统一API客户端类
 */
class UnifiedApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };

    // 开发环境输出初始化信息
    if (ENV_INFO.IS_DEVELOPMENT) {
      console.log(`🔗 API Client initialized: ${this.baseURL}`);
    }
  }

  /**
   * 获取认证令牌
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * 设置认证令牌
   */
  public setAuthToken(token: string | null): void {
    if (typeof window === 'undefined') return;

    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * 构建请求头
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };

    // 添加认证头
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * 统一请求方法
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { body, headers: customHeaders, ...restOptions } = options;

    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders(customHeaders);

    // 构建请求配置
    const requestInit: RequestInit = {
      headers,
      ...restOptions
    };

    // 处理请求体
    if (body !== undefined) {
      requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      // 开发环境日志
      if (ENV_INFO.IS_DEVELOPMENT) {
        console.log(`🔄 ${requestInit.method || 'GET'} ${url}`, {
          headers: this.sanitizeHeaders(headers),
          body: body
        });
      }

      const response = await fetch(url, requestInit);

      // 处理响应
      let responseData: unknown;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // 开发环境响应日志
      if (ENV_INFO.IS_DEVELOPMENT) {
        console.log(`✅ ${response.status} ${url}`, responseData);
      }

      // 处理HTTP错误状态
      if (!response.ok) {
        const apiResponse = responseData as ApiResponse;
        throw new Error(
          apiResponse.message ||
          apiResponse.error ||
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return responseData as T;

    } catch (error) {
      // 开发环境错误日志
      if (ENV_INFO.IS_DEVELOPMENT) {
        console.error(`❌ ${requestInit.method || 'GET'} ${url}`, error);
      }

      // 重新抛出错误以便上层处理
      throw error;
    }
  }

  /**
   * 脱敏请求头（隐藏敏感信息）
   */
  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = { ...headers };
    if (sanitized['Authorization']) {
      sanitized['Authorization'] = 'Bearer [REDACTED]';
    }
    return sanitized;
  }

  // ===========================================
  // HTTP 方法封装
  // ===========================================

  /**
   * GET 请求
   */
  public async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    const options: RequestOptions = { method: 'GET' };
    if (headers) options.headers = headers;
    return this.request<T>(endpoint, options);
  }

  /**
   * POST 请求
   */
  public async post<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    const options: RequestOptions = { method: 'POST', body };
    if (headers) options.headers = headers;
    return this.request<T>(endpoint, options);
  }

  /**
   * PUT 请求
   */
  public async put<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    const options: RequestOptions = { method: 'PUT', body };
    if (headers) options.headers = headers;
    return this.request<T>(endpoint, options);
  }

  /**
   * DELETE 请求
   */
  public async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    const options: RequestOptions = { method: 'DELETE' };
    if (headers) options.headers = headers;
    return this.request<T>(endpoint, options);
  }

  // ===========================================
  // 便捷方法
  // ===========================================

  /**
   * 检查API连接状态
   */
  public async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      // 尝试获取用户配置文件作为健康检查
      await this.get('/auth/profile');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 获取客户端配置信息
   */
  public getConfig() {
    return {
      baseURL: this.baseURL,
      endpoints: API_ENDPOINTS,
      environment: ENV_INFO
    };
  }
}

// 创建并导出统一的API客户端实例
export const apiClient = new UnifiedApiClient(API_BASE_URL);

// 导出API端点常量以便使用
export { API_ENDPOINTS };
