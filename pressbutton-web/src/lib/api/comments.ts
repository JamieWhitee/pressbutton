/**
 * Comments API Client with JWT Authentication Integration
 * This client handles all comment-related API operations including viewing and creating comments
 * 集成JWT认证的评论API客户端 - 处理所有评论相关API操作，包括查看和创建评论
 */

import { enterpriseApiClient, type ApiResponse } from './enterprise-api-client';
import { enterpriseLogger, OperationType } from '../logging/enterprise-logger';

// Comment interface matching backend CommentResponseDto
// 匹配后端CommentResponseDto的评论接口
export interface Comment {
  id: number;                    // Comment ID / 评论ID
  content: string;               // Comment text content / 评论文本内容
  createdAt: string;             // ISO timestamp when comment was created / 评论创建时间
  updatedAt: string;             // ISO timestamp when comment was last updated / 评论最后更新时间
  user: {                        // Comment author information / 评论作者信息
    id: number;                  // Author's user ID / 作者用户ID
    name: string | null;         // Author's display name (nullable) / 作者显示名称（可为空）
    email: string;               // Author's email address / 作者邮箱地址
  };
  questionId: number;            // ID of the question this comment belongs to / 此评论所属问题的ID
}

// Data Transfer Object for creating comments
// 创建评论的数据传输对象
export interface CreateCommentData {
  content: string;               // Comment text content (1-1000 characters) / 评论文本内容（1-1000字符）
  questionId: number;            // ID of the question to comment on / 要评论的问题ID
  // Note: userId is automatically extracted from JWT token / 注意：userId自动从JWT令牌中提取
}

/**
 * Backend API Response matching your ApiResponseDto<T> and PaginatedResponseDto<T>
 * These are the exact formats your NestJS controllers return
 * 匹配你的ApiResponseDto<T>和PaginatedResponseDto<T>的后端API响应
 */
interface BackendApiResponse<T> {
  success: boolean;              // Request success status / 请求成功状态
  message: string;               // Response message / 响应消息
  data?: T;                      // Actual data payload / 实际数据载荷
  error?: string;                // Error details if failed / 失败时的错误详情
  timestamp: string;             // ISO timestamp / ISO时间戳
}

interface BackendPaginatedResponse<T> extends BackendApiResponse<T[]> {
  pagination: {                 // Pagination metadata / 分页元数据
    page: number;                // Current page number (1-based) / 当前页码（从1开始）
    limit: number;               // Items per page / 每页项目数
    total: number;               // Total count of all items / 所有项目总数
    totalPages: number;          // Total number of pages / 总页数
  };
}

/**
 * Comments API service with JWT authentication
 * All methods automatically include JWT tokens in headers via enterpriseApiClient
 * 带JWT认证的评论API服务，所有方法通过enterpriseApiClient自动在标头中包含JWT令牌
 */
export const commentsApi = {
  /**
   * Get paginated comments for a specific question
   * Authentication: JWT token required
   * Endpoint: GET /api/comments/question/:questionId
   * 获取特定问题的分页评论，需要JWT令牌认证
   */
  async getByQuestionId(
    questionId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ comments: Comment[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    try {
      // Log the API operation start
      // 记录API操作开始
      enterpriseLogger.info('Comments API getByQuestionId operation started', {
        questionId,
        page,
        limit,
        endpoint: `/comments/question/${questionId}`
      }, OperationType.DATA_READ);

      // Build URL with pagination parameters
      // 构建带分页参数的URL
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const url = `/comments/question/${questionId}?${queryParams.toString()}`;

      // Make authenticated request to get comments
      // JWT token is automatically included by enterpriseApiClient
      // 发起认证请求获取评论，JWT令牌由enterpriseApiClient自动包含
      const response: ApiResponse<BackendPaginatedResponse<Comment>> = await enterpriseApiClient.get(url);

      // Check enterprise client success
      // 检查企业客户端成功状态
      if (!response.success || !response.data) {
        enterpriseLogger.error('Enterprise client request failed for getByQuestionId', {
          questionId,
          page,
          limit,
          error: response.error?.message || 'Unknown error'
        }, OperationType.API_ERROR);
        throw new Error(response.error?.message || 'Enterprise client request failed');
      }

      // Check backend API success
      // 检查后端API成功状态
      const backendResponse = response.data;
      if (!backendResponse.success) {
        enterpriseLogger.warn('Backend API returned error for getByQuestionId', {
          questionId,
          page,
          limit,
          backendMessage: backendResponse.message,
          backendError: backendResponse.error
        }, OperationType.API_ERROR);
        throw new Error(backendResponse.error || backendResponse.message || 'Failed to fetch comments');
      }

      // Extract comments and pagination data
      // 提取评论和分页数据
      const comments = backendResponse.data || [];
      const pagination = backendResponse.pagination;

      // Log successful operation
      // 记录成功操作
      enterpriseLogger.info('Comments getByQuestionId operation completed successfully', {
        questionId,
        page,
        limit,
        commentsCount: comments.length,
        totalComments: pagination.total,
        totalPages: pagination.totalPages
      }, OperationType.DATA_READ);

      return {
        comments,
        pagination
      };

    } catch (error) {
      // Log the error with proper context
      // 记录错误及其上下文
      enterpriseLogger.error('Comments getByQuestionId operation failed', {
        questionId,
        page,
        limit,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error)
      }, OperationType.API_ERROR);

      throw error;
    }
  },

  /**
   * Create a new comment on a question
   * Authentication: JWT token required - user must be logged in
   * User ID is automatically extracted from JWT token by backend
   * Endpoint: POST /api/comments
   * 在问题上创建新评论，需要JWT令牌认证 - 用户必须已登录
   * 用户ID由后端自动从JWT令牌中提取
   */
  async create(commentData: CreateCommentData): Promise<Comment> {
    try {
      // Log the API operation start
      // 记录API操作开始
      enterpriseLogger.info('Comments API create operation started', {
        questionId: commentData.questionId,
        contentLength: commentData.content.length,
        endpoint: '/comments'
      }, OperationType.DATA_CREATE);

      // Send POST request with comment data
      // JWT token in Authorization header identifies the author
      // 发送带有评论数据的POST请求，Authorization标头中的JWT令牌标识作者
      const response: ApiResponse<BackendApiResponse<Comment>> = await enterpriseApiClient.post('/comments', commentData);

      // Check enterprise client success
      // 检查企业客户端成功状态
      if (!response.success || !response.data) {
        enterpriseLogger.error('Enterprise client request failed for create comment', {
          questionId: commentData.questionId,
          error: response.error?.message || 'Unknown error'
        }, OperationType.API_ERROR);
        throw new Error(response.error?.message || 'Enterprise client request failed');
      }

      // Check backend creation success
      // 检查后端创建成功状态
      const backendResponse = response.data;
      if (!backendResponse.success) {
        enterpriseLogger.warn('Backend API returned error for create comment', {
          questionId: commentData.questionId,
          backendMessage: backendResponse.message,
          backendError: backendResponse.error
        }, OperationType.API_ERROR);
        throw new Error(backendResponse.error || backendResponse.message || 'Failed to create comment');
      }

      // Return the newly created comment
      // 返回新创建的评论
      if (!backendResponse.data) {
        enterpriseLogger.error('No comment data in successful backend response', {
          questionId: commentData.questionId,
          response: backendResponse
        }, OperationType.SYSTEM_ERROR);
        throw new Error('No comment data received from backend');
      }

      const newComment = backendResponse.data;

      // Log successful operation
      // 记录成功操作
      enterpriseLogger.info('Comments create operation completed successfully', {
        questionId: commentData.questionId,
        commentId: newComment.id,
        authorId: newComment.user.id,
        contentLength: newComment.content.length
      }, OperationType.DATA_CREATE);

      return newComment;

    } catch (error) {
      // Log the error with proper context
      // 记录错误及其上下文
      enterpriseLogger.error('Comments create operation failed', {
        questionId: commentData.questionId,
        contentLength: commentData.content.length,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error)
      }, OperationType.API_ERROR);

      throw error;
    }
  }
};

/**
 * Utility functions for handling comments
 * 处理评论的实用函数
 */

/**
 * Format comment creation time to relative time
 * 将评论创建时间格式化为相对时间
 */
export const formatCommentTime = (createdAt: string): string => {
  const now = new Date();
  const commentTime = new Date(createdAt);
  const diffInSeconds = Math.floor((now.getTime() - commentTime.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '刚刚';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分钟前`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}小时前`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}天前`;
  } else {
    // For older comments, show the actual date
    // 对于较旧的评论，显示实际日期
    return commentTime.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

/**
 * Get display name for comment author
 * 获取评论作者的显示名称
 */
export const getAuthorDisplayName = (user: Comment['user']): string => {
  return user.name || user.email.split('@')[0] || '匿名用户';
};

/**
 * Get avatar letter for comment author
 * 获取评论作者的头像字母
 */
export const getAuthorAvatarLetter = (user: Comment['user']): string => {
  if (user.name) {
    return user.name.charAt(0).toUpperCase();
  }
  return user.email.charAt(0).toUpperCase();
};

/**
 * Check if error is authentication related
 * 检查错误是否与认证相关
 */
export const isAuthenticationError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return message.includes('401') ||
         message.includes('unauthorized') ||
         message.includes('authentication') ||
         message.includes('invalid token') ||
         message.includes('token expired');
};

/**
 * Check if error is authorization related (user doesn't have permission)
 * 检查错误是否与授权相关（用户没有权限）
 */
export const isAuthorizationError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return message.includes('403') ||
         message.includes('forbidden') ||
         message.includes('authorization') ||
         message.includes('permission denied') ||
         message.includes('access denied');
};
