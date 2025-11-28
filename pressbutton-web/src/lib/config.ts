/**
 * 🌐 PressButton API Configuration
 *
 * 统一的API配置管理，支持多环境自动切换
 * - 本地开发: http://localhost:3001/api
 * - Docker环境: http://docker-backend:3001/api
 * - 生产环境: https://productionTodo/api
 */

/**
 * 获取API基础URL - 智能环境检测
 *
 * 优先级：
 * 1. 环境变量 NEXT_PUBLIC_API_URL
 * 2. 开发环境默认值
 * 3. 生产环境必须配置
 */
function getApiBaseUrl(): string {
  // 从环境变量获取
  if (process.env['NEXT_PUBLIC_API_URL']) {
    const url = process.env['NEXT_PUBLIC_API_URL'];

    // 验证URL格式
    try {
      new URL(url);
      return url;
    } catch (error) {
      console.warn(`⚠️ Invalid API URL format: ${url}`);
    }
  }

  // 开发环境默认配置
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001/api';
  }

  // 生产环境必须明确配置
  throw new Error(
    'NEXT_PUBLIC_API_URL must be configured. ' +
    'Please set this environment variable in your deployment configuration.'
  );
}

// 导出API基础URL
export const API_BASE_URL = getApiBaseUrl();

/**
 * API端点常量 - 统一管理所有API路径
 */
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    GUEST_SIGNUP: '/auth/guest-signup'
  },

  // 问题相关
  QUESTIONS: {
    ALL: '/questions/all',
    TOP: '/questions/top',
    RANDOM: '/questions/random',
    BY_AUTHOR: (authorId: string) => `/questions/author/${authorId}`,
    BY_ID: (id: string) => `/questions/${id}`,
    CREATE: '/questions/create',
    CREATE_TEST: '/questions/create-test',
    DELETE: '/questions/delete',
    VOTE: (id: string) => `/questions/${id}/vote`,
    STATUS: (id: string) => `/questions/${id}/status`
  },

  // 评论相关
  COMMENTS: {
    BY_QUESTION: (questionId: string) => `/comments/question/${questionId}`,
    CREATE: '/comments'
  }
} as const;

/**
 * 环境信息 - 用于调试和监控
 */
export const ENV_INFO = {
  API_BASE_URL,
  NODE_ENV: process.env['NODE_ENV'],
  IS_DEVELOPMENT: process.env['NODE_ENV'] === 'development',
  IS_PRODUCTION: process.env['NODE_ENV'] === 'production',
  BUILD_TIME: new Date().toISOString()
} as const;

// 开发环境下输出配置信息
if (typeof window !== 'undefined' && ENV_INFO.IS_DEVELOPMENT) {
  console.log('🔧 PressButton API Configuration:', ENV_INFO);
}
