/**
 * 🔐 认证相关API封装
 *
 * 统一管理所有认证相关的API调用
 * - 用户登录/注册
 * - 访客注册
 * - 用户资料获取
 * - JWT令牌管理
 */

import { apiClient, API_ENDPOINTS } from '../api-client';

// ===========================================
// 类型定义
// ===========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
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

export interface GuestSignupResponse {
  user: User;
  access_token: string;
  token_type: string;
  guestCredentials: {
    email: string;
    password: string;
  };
}

// ===========================================
// 认证API服务
// ===========================================

/**
 * 认证API服务类
 * 统一管理所有认证相关的API调用
 */
class AuthApiService {
  /**
   * 用户登录
   *
   * @param credentials 登录凭据 (邮箱和密码)
   * @returns 认证响应，包含用户信息和JWT令牌
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // 自动保存JWT令牌
      if (response.access_token) {
        apiClient.setAuthToken(response.access_token);
      }

      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Login failed'
      );
    }
  }

  /**
   * 用户注册
   *
   * @param userData 注册数据 (邮箱、密码、可选姓名)
   * @returns 认证响应，包含用户信息和JWT令牌
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );

      // 自动保存JWT令牌
      if (response.access_token) {
        apiClient.setAuthToken(response.access_token);
      }

      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Registration failed'
      );
    }
  }

  /**
   * 访客用户注册
   *
   * 创建临时访客账户，用于匿名参与游戏
   * @returns 访客认证响应，包含自动生成的凭据
   */
  async guestSignup(): Promise<GuestSignupResponse> {
    try {
      const response = await apiClient.post<GuestSignupResponse>(
        API_ENDPOINTS.AUTH.GUEST_SIGNUP
      );

      // 自动保存JWT令牌
      if (response.access_token) {
        apiClient.setAuthToken(response.access_token);
      }

      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Guest signup failed'
      );
    }
  }

  /**
   * 获取当前用户资料
   *
   * @returns 当前登录用户的详细信息
   */
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.PROFILE);
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get profile'
      );
    }
  }

  /**
   * 用户登出
   *
   * 清除本地存储的JWT令牌
   */
  logout(): void {
    apiClient.setAuthToken(null);
  }

  /**
   * 检查用户是否已登录
   *
   * @returns 是否存在有效的JWT令牌
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * 获取当前JWT令牌
   *
   * @returns JWT令牌字符串或null
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }
}

// 导出认证API服务实例
export const authApi = new AuthApiService();
