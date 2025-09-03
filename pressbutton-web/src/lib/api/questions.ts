/**
 * Questions API Client with JWT Authentication Integration
 * This client automatically handles JWT token authentication using your existing auth system
 * 集成JWT认证的问题API客户端 - 自动处理JWT令牌认证，使用你现有的认证系统
 */

import { enterpriseApiClient, type ApiResponse } from './enterprise-api-client';
import { enterpriseLogger, OperationType } from '../logging/enterprise-logger';

// Question interface matching your backend Prisma schema
// 匹配你后端Prisma架构的问题接口
export interface Question {
  id: number;                    // Primary key auto-increment / 主键自增ID
  positiveOutcome: string;       // Benefits of pressing the button (NOTE: singular form from backend) / 按下按钮的好处（注意：后端使用单数形式）
  negativeOutcome: string;       // Consequences of pressing the button (NOTE: singular form from backend) / 按下按钮的后果（注意：后端使用单数形式）
  createdAt: string;             // ISO timestamp when question was created / 问题创建时间
  updatedAt: string;             // ISO timestamp when question was last updated / 问题最后更新时间
  authorId: number;              // Foreign key to User table / 用户表外键
  author?: {                     // Populated author information from User table (optional for getById) / 从用户表填充的作者信息（getById时可选）
    id: number;                  // Author's user ID / 作者的用户ID
    name: string;                // Author's display name / 作者的显示名称
    email: string;               // Author's email address / 作者的邮箱地址
  };
  _count?: {                     // Prisma count aggregation (optional for getById) / Prisma计数聚合（getById时可选）
    votes: number;               // Total vote count via COUNT() / 通过COUNT()计算的总投票数
    comments: number;            // Total comment count via COUNT() / 通过COUNT()计算的总评论数
  };
  votes?: Vote[];                // Related votes via Prisma relation (optional) / 通过Prisma关系的相关投票（可选）
}

// Vote interface matching your backend Vote model
// 匹配你后端Vote模型的投票接口
export interface Vote {
  id: number;                    // Primary key auto-increment / 主键自增ID
  choice: 'PRESS' | 'DONT_PRESS'; // Enum value for user choice / 用户选择的枚举值
  userId: number;                // Foreign key to User table / 用户表外键
  questionId: number;            // Foreign key to Question table / 问题表外键
  createdAt: string;             // ISO timestamp when vote was cast / 投票时间
  user: {                        // Populated user information / 填充的用户信息
    id: number;                  // Voter's user ID / 投票者的用户ID
    name: string;                // Voter's display name / 投票者的显示名称
  };
}

// Data Transfer Object for creating questions
// 创建问题的数据传输对象
export interface CreateQuestionsData {
  positiveOutcome: string;       // Required field for benefits (NOTE: singular form to match backend) / 好处的必填字段（注意：单数形式匹配后端）
  negativeOutcome: string;       // Required field for consequences (NOTE: singular form to match backend) / 后果的必填字段（注意：单数形式匹配后端）
  // NOTE: authorId is no longer needed here - it's automatically extracted from JWT token
  // 注意：这里不再需要authorId - 它会自动从JWT令牌中提取
}

// Data Transfer Object for creating questions in development testing (with authorId)
// 开发测试中创建问题的数据传输对象（包含authorId）
export interface CreateQuestionsTestData {
  positiveOutcome: string;       // Required field for benefits / 好处的必填字段
  negativeOutcome: string;       // Required field for consequences / 后果的必填字段
  authorId: number;              // Required field for question author (for development testing) / 问题作者的必填字段（用于开发测试）
}

// Data Transfer Object for voting - user ID automatically extracted from JWT token
// 投票的数据传输对象 - 用户ID自动从JWT令牌中提取
export interface VoteData {
  choice: 'PRESS' | 'DONT_PRESS'; // User's voting choice / 用户的投票选择
}

/**
 * Backend API Response matching your ApiResponseDto<T> class
 * This is the exact format your NestJS controllers return
 * 匹配你的ApiResponseDto<T>类的后端API响应，这是你的NestJS控制器返回的确切格式
 */
interface BackendApiResponse<T> {
  success: boolean;              // Request success status from ApiResponseDto / 来自ApiResponseDto的请求成功状态
  message: string;               // Response message like "Success" / 响应消息如"Success"
  data?: T;                      // Actual data payload (optional) / 实际数据载荷（可选）
  error?: string;                // Error details if request failed / 请求失败时的错误详情
  timestamp: string;             // ISO timestamp from new Date().toISOString() / 来自new Date().toISOString()的ISO时间戳
}

/**
 * Paginated response matching your PaginatedResponseDto<T> class
 * Used for endpoints that return lists with pagination metadata
 * 匹配你的PaginatedResponseDto<T>类的分页响应，用于返回带分页元数据的列表端点
 */
interface BackendPaginatedResponse<T> extends BackendApiResponse<T[]> {
  pagination: {                 // Pagination metadata from PaginationDto / 来自PaginationDto的分页元数据
    page: number;                // Current page number (1-based) / 当前页码（从1开始）
    limit: number;               // Items per page limit / 每页项目限制
    total: number;               // Total count of all items / 所有项目的总数
    totalPages: number;          // Total number of pages calculated / 计算的总页数
  };
}

/**
 * Question voting statistics interface
 * For /api/questions/{id}/status endpoint response
 * 问题投票统计接口，用于/api/questions/{id}/status端点响应
 */
interface QuestionStatus {
  totalVotes: number;            // Total number of votes on this question / 该问题的总投票数
  pressVotes: number;            // Number of users who chose "PRESS" / 选择"按下"的用户数
  dontPressVotes: number;        // Number of users who chose "DONT_PRESS" / 选择"不按下"的用户数
  pressPercentage: number;       // Percentage of PRESS votes (0-100) / 按下投票的百分比（0-100）
  dontPressPercentage: number;   // Percentage of DONT_PRESS votes (0-100) / 不按下投票的百分比（0-100）
}

/**
 * Questions API service with JWT authentication
 * All methods automatically include JWT tokens in headers via enterpriseApiClient
 * 带JWT认证的问题API服务，所有方法通过enterpriseApiClient自动在标头中包含JWT令牌
 */
export const questionsApi = {
  /**
   * Get all questions with optional filtering by author
   * Endpoint: GET /api/questions/all or GET /api/questions/all?authorId=2
   * Backend returns: BackendApiResponse<Question[]> or BackendPaginatedResponse<Question>
   * 获取所有问题，可选择按作者过滤
   */
  async getAll(authorId?: number): Promise<Question[]> {
    try {
      // Log the API operation start using enterprise logger
      // 使用企业级日志记录器记录API操作开始
      enterpriseLogger.info('Question API getAll operation started', {
        authorId: authorId || 'all',
        hasFilter: !!authorId
      }, OperationType.DATA_READ);

      // Build the URL with optional authorId parameter
      // 构建带有可选authorId参数的URL
      const url = authorId
        ? `/questions/author/${authorId}`        // Filter by specific author using correct endpoint / 使用正确端点按特定作者过滤
        : '/questions/all';                      // Get all questions / 获取所有问题

      // Make the API request using your enterprise client
      // The enterprise client returns ApiResponse<T>, we need to extract the backend response
      // 使用企业级客户端发起API请求，企业客户端返回ApiResponse<T>，我们需要提取后端响应
      const response: ApiResponse<BackendApiResponse<Question[]>> = await enterpriseApiClient.get(url);

      // First, check if the enterprise client request was successful
      // 首先，检查企业级客户端请求是否成功
      if (!response.success || !response.data) {
        enterpriseLogger.error('Enterprise client request failed for getAll', {
          authorId: authorId || 'all',
          error: response.error?.message || 'Unknown error'
        }, OperationType.API_ERROR);
        throw new Error(response.error?.message || 'Enterprise client request failed');
      }

      // Then, check if the backend API call was successful
      // Extract the backend response from the enterprise client response
      // 然后，检查后端API调用是否成功，从企业客户端响应中提取后端响应
      const backendResponse = response.data;
      if (!backendResponse.success) {
        enterpriseLogger.warn('Backend API returned error for getAll', {
          authorId: authorId || 'all',
          backendMessage: backendResponse.message,
          backendError: backendResponse.error
        }, OperationType.API_ERROR);
        throw new Error(backendResponse.error || backendResponse.message || 'Backend returned error');
      }

      // Finally, return the actual questions data
      // The data should be an array of Question objects
      // 最后，返回实际的问题数据，数据应该是Question对象的数组
      const questions = backendResponse.data || [];

      // Log successful operation
      // 记录成功操作
      enterpriseLogger.info('Question getAll operation completed successfully', {
        authorId: authorId || 'all',
        questionCount: questions.length,
        hasFilter: !!authorId
      }, OperationType.DATA_READ);

      return questions;

    } catch (error) {
      // Log the error using enterprise logger with proper context
      // 使用企业级日志记录器记录错误，包含适当的上下文
      enterpriseLogger.error('Question getAll operation failed', {
        authorId: authorId || 'all',
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error)
      }, OperationType.API_ERROR);

      throw error;
    }
  },

  /**
   * Get single question by ID with full details
   * Authentication: JWT token required for access
   * Endpoint: GET /api/questions/{id}
   * 根据ID获取单个问题的完整详情，需要JWT令牌进行访问
   */
  async getById(questionId: number): Promise<Question> {
    try {
      // Log the API operation start using enterprise logger
      // 使用企业级日志记录器记录API操作开始
      enterpriseLogger.info('Question API getById operation started', {
        questionId,
        endpoint: `/questions/${questionId}`
      }, OperationType.DATA_READ);

      // Make authenticated request to get specific question
      // Your JwtAuthGuard will automatically validate the token
      // 发起认证请求获取特定问题，你的JwtAuthGuard将自动验证令牌
      const response: ApiResponse<BackendApiResponse<Question>> = await enterpriseApiClient.get(`/questions/${questionId}`);

      // Check enterprise client success
      // 检查企业客户端成功状态
      if (!response.success || !response.data) {
        enterpriseLogger.error('Enterprise client request failed for getById', {
          questionId,
          error: response.error?.message || 'Unknown error'
        }, OperationType.API_ERROR);
        throw new Error(response.error?.message || 'Enterprise client request failed');
      }

      // Check backend API success
      // If question doesn't exist, backend returns 404 wrapped in ApiResponseDto.error()
      // 检查后端API成功状态，如果问题不存在，后端返回包装在ApiResponseDto.error()中的404
      const backendResponse = response.data;
      if (!backendResponse.success) {
        enterpriseLogger.warn('Backend API returned error for getById', {
          questionId,
          backendMessage: backendResponse.message,
          backendError: backendResponse.error,
          timestamp: backendResponse.timestamp
        }, OperationType.API_ERROR);
        throw new Error(backendResponse.error || backendResponse.message || 'Question not found');
      }

      // Return the question object with populated relations (author, votes, _count)
      // 返回带有填充关系的问题对象（作者、投票、_count）
      if (!backendResponse.data) {
        enterpriseLogger.error('No data in successful backend response for getById', {
          questionId,
          response: backendResponse
        }, OperationType.SYSTEM_ERROR);
        throw new Error('No question data received from backend');
      }

      // Log successful operation
      // 记录成功操作
      enterpriseLogger.info('Question getById operation completed successfully', {
        questionId,
        questionTitle: `${backendResponse.data.positiveOutcome?.substring(0, 50)}...`,
        authorId: backendResponse.data.authorId
      }, OperationType.DATA_READ);

      return backendResponse.data;

    } catch (error) {
      // Log the error using enterprise logger with proper context
      // 使用企业级日志记录器记录错误，包含适当的上下文
      enterpriseLogger.error('Question getById operation failed', {
        questionId,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        stackTrace: error instanceof Error ? error.stack : 'No stack trace'
      }, OperationType.API_ERROR);

      throw error;
    }
  },

  /**
   * Get a random question that the user hasn't voted on yet
   * Authentication: No JWT token required for anonymous users
   * Endpoint: GET /api/questions/random?userId={userId}
   * 获取用户尚未投票的随机问题，匿名用户无需JWT令牌
   */
  async getRandom(userId?: number): Promise<Question | null> {
    try {
      // Log the API operation start using enterprise logger
      // 使用企业级日志记录器记录API操作开始
      enterpriseLogger.info('Starting question getRandom operation', {
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString()
      }, OperationType.DATA_READ);

      // Build query parameters
      // 构建查询参数
      const queryParams = new URLSearchParams();
      if (userId) {
        queryParams.append('userId', userId.toString());
      }
      const queryString = queryParams.toString();
      const endpoint = `/questions/random${queryString ? `?${queryString}` : ''}`;

      // Make API call to backend
      // 调用后端API
      const response: ApiResponse<BackendApiResponse<Question>> = await enterpriseApiClient.get(endpoint);

      // First, check if the enterprise client call was successful
      // 首先，检查企业客户端调用是否成功
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Enterprise client request failed');
      }

      // Then, check if the backend API call was successful
      // Extract the backend response from the enterprise client response
      // 然后，检查后端API调用是否成功，从企业客户端响应中提取后端响应
      const backendResponse = response.data;
      if (!backendResponse.success) {
        // If no questions available, return null instead of throwing error
        // 如果没有可用问题，返回null而不是抛出错误
        if (backendResponse.error?.includes('No available questions')) {
          enterpriseLogger.info('No random questions available for user', {
            userId: userId || 'anonymous',
            reason: 'No unvoted questions found'
          }, OperationType.DATA_READ);
          return null;
        }

        enterpriseLogger.warn('Backend API returned error for getRandom', {
          userId: userId || 'anonymous',
          backendMessage: backendResponse.message,
          backendError: backendResponse.error
        }, OperationType.API_ERROR);
        throw new Error(backendResponse.error || backendResponse.message || 'Backend returned error');
      }

      // Return the random question data
      // 返回随机问题数据
      const question = backendResponse.data;
      if (!question) {
        return null;
      }

      // Log successful operation
      // 记录成功操作
      enterpriseLogger.info('Question getRandom operation completed successfully', {
        userId: userId || 'anonymous',
        questionId: question.id,
        hasUserFilter: !!userId
      }, OperationType.DATA_READ);

      return question;

    } catch (error) {
      // Log the error using enterprise logger with proper context
      // 使用企业级日志记录器记录错误，包含适当的上下文
      enterpriseLogger.error('Question getRandom operation failed', {
        userId: userId || 'anonymous',
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error)
      }, OperationType.API_ERROR);

      throw error;
    }
  },

  /**
   * Create a new question
   * Authentication: JWT token required - user must be logged in
   * Endpoint: POST /api/questions
   * 创建新问题，需要JWT令牌 - 用户必须已登录
   */
  async create(questionData: CreateQuestionsData): Promise<Question> {
    try {
      // Send POST request with question data in request body
      // JWT token in Authorization header identifies the author
      // 发送带有请求体中问题数据的POST请求，Authorization标头中的JWT令牌标识作者
      const response: ApiResponse<BackendApiResponse<Question>> = await enterpriseApiClient.post('/questions/create', questionData);

      // Check enterprise client success
      // 检查企业客户端成功状态
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Enterprise client request failed');
      }

      // Check backend creation success
      // If validation fails, backend returns 400 with validation error details
      // 检查后端创建成功状态，如果验证失败，后端返回400和验证错误详情
      const backendResponse = response.data;
      if (!backendResponse.success) {
        throw new Error(backendResponse.error || backendResponse.message || 'Failed to create question');
      }

      // Return the newly created question with auto-generated ID and timestamps
      // 返回新创建的问题，包含自动生成的ID和时间戳
      if (!backendResponse.data) {
        throw new Error('No question data received after creation');
      }

      return backendResponse.data;

    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  /**
   * Create a new question for testing (No Authentication Required)
   * DEVELOPMENT ONLY: This endpoint bypasses JWT authentication for testing
   * Endpoint: POST /api/questions/create-test
   * 创建新问题用于测试（无需认证）- 仅用于开发：此端点绕过JWT认证用于测试
   */
  async createTest(questionData: CreateQuestionsTestData): Promise<Question> {
    try {
      // Send POST request to test endpoint with authorId included
      // 向测试端点发送POST请求，包含authorId
      const response: ApiResponse<BackendApiResponse<Question>> = await enterpriseApiClient.post('/questions/create-test', questionData);

      // Check enterprise client success
      // 检查企业客户端成功状态
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Enterprise client request failed');
      }

      // Check backend creation success
      // 检查后端创建成功状态
      const backendResponse = response.data;
      if (!backendResponse.success) {
        throw new Error(backendResponse.error || backendResponse.message || 'Failed to create test question');
      }

      // Return the newly created question
      // 返回新创建的问题
      if (!backendResponse.data) {
        throw new Error('No question data received after test creation');
      }

      return backendResponse.data;

    } catch (error) {
      console.error('Error creating test question:', error);
      throw error;
    }
  },

  /**
   * Vote on a question
   * Authentication: JWT token required - user must be logged in to vote
   * User ID is automatically extracted from JWT token by backend
   * Endpoint: POST /api/questions/{id}/vote
   * 对问题投票，需要JWT令牌 - 用户必须已登录才能投票
   * 用户ID由后端自动从JWT令牌中提取
   */
  async vote(questionId: number, voteData: VoteData): Promise<Vote> {
    try {
      // Send only vote choice to backend - user ID extracted from JWT token
      // JWT token automatically identifies which user is voting
      // Backend will prevent duplicate votes from same user
      // 只向后端发送投票选择 - 用户ID从JWT令牌中提取
      // JWT令牌自动标识投票用户，后端将防止同一用户的重复投票
      const response: ApiResponse<BackendApiResponse<Vote>> = await enterpriseApiClient.post(`/questions/${questionId}/vote`, voteData);

      // Check enterprise client success
      // 检查企业客户端成功状态
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Enterprise client request failed');
      }

      // Check backend vote submission success
      // Backend may return 409 if user already voted on this question
      // 检查后端投票提交成功状态，如果用户已对此问题投票，后端可能返回409
      const backendResponse = response.data;
      if (!backendResponse.success) {
        throw new Error(backendResponse.error || backendResponse.message || 'Failed to submit vote');
      }

      // Return the created vote record with user and question relations
      // 返回创建的投票记录，包含用户和问题关系
      if (!backendResponse.data) {
        throw new Error('No vote data received after submission');
      }

      return backendResponse.data;

    } catch (error) {
      console.error(`Error voting on question ${questionId}:`, error);
      throw error;
    }
  },

  /**
   * Get voting statistics for a question
   * Authentication: May require JWT token depending on your backend implementation
   * Endpoint: GET /api/questions/{id}/status
   * 获取问题的投票统计，根据你的后端实现可能需要JWT令牌
   */
  async getStatus(questionId: number): Promise<QuestionStatus> {
    try {
      // Get aggregated voting statistics for the question
      // This endpoint might be public or protected depending on your requirements
      // 获取问题的聚合投票统计，该端点可能是公开的或受保护的，取决于你的需求
      const response: ApiResponse<BackendApiResponse<QuestionStatus>> = await enterpriseApiClient.get(`/questions/${questionId}/status`);

      // Check enterprise client success
      // 检查企业客户端成功状态
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Enterprise client request failed');
      }

      // Check backend status retrieval success
      // 检查后端状态获取成功状态
      const backendResponse = response.data;
      if (!backendResponse.success) {
        throw new Error(backendResponse.error || backendResponse.message || 'Failed to fetch question status');
      }

      // Return voting statistics calculated by backend
      // 返回后端计算的投票统计
      if (!backendResponse.data) {
        throw new Error('No status data received from backend');
      }

      return backendResponse.data;

    } catch (error) {
      console.error(`Error fetching question status for ${questionId}:`, error);
      throw error;
    }
  },

  /**
   * Get current user's vote for a specific question
   * Authentication: JWT token required to identify the user
   * Endpoint: GET /api/questions/{id}/my-vote (may need to be implemented)
   * 获取当前用户对特定问题的投票，需要JWT令牌来标识用户
   */
  async getUserVote(questionId: number): Promise<Vote | null> {
    try {
      // Get the authenticated user's vote for this question
      // JWT token in header tells backend which user to check
      // 获取认证用户对此问题的投票，标头中的JWT令牌告诉后端检查哪个用户
      const response: ApiResponse<BackendApiResponse<Vote>> = await enterpriseApiClient.get(`/questions/${questionId}/my-vote`);

      // If enterprise client request failed, assume no vote exists
      // 如果企业客户端请求失败，假设不存在投票
      if (!response.success || !response.data) {
        return null;
      }

      // Check backend response
      // If user hasn't voted, backend should return 404 or empty result
      // 检查后端响应，如果用户尚未投票，后端应返回404或空结果
      const backendResponse = response.data;
      if (!backendResponse.success) {
        // Expected behavior when user hasn't voted on this question
        // 用户尚未对此问题投票时的预期行为
        if (backendResponse.message?.includes('not found') ||
            backendResponse.error?.includes('not found') ||
            backendResponse.message?.includes('No vote found')) {
          return null;
        }
        // For other errors, throw them for proper error handling
        // 对于其他错误，抛出它们以进行适当的错误处理
        throw new Error(backendResponse.error || backendResponse.message || 'Failed to fetch user vote');
      }

      // Return the user's vote if it exists
      // 如果存在则返回用户的投票
      return backendResponse.data || null;

    } catch (error) {
      // Handle 404 errors gracefully (user hasn't voted)
      // 优雅地处理404错误（用户尚未投票）
      if (error instanceof Error && (
          error.message.includes('404') ||
          error.message.includes('not found') ||
          error.message.includes('No vote found')
        )) {
        return null;
      }

      console.error(`Error fetching user vote for question ${questionId}:`, error);
      throw error;
    }
  }
};

/**
 * Utility functions for handling backend responses
 * These help with type safety and error handling
 * 处理后端响应的实用函数，这些有助于类型安全和错误处理
 */

/**
 * Type guard to check if backend response is successful
 * 类型守卫，检查后端响应是否成功
 */
export const isBackendResponseSuccessful = <T>(
  response: BackendApiResponse<T>
): response is BackendApiResponse<T> & { data: T } => {
  return response.success && response.data !== undefined && response.data !== null;
};

/**
 * Extract error message from backend response
 * 从后端响应中提取错误消息
 */
export const getBackendErrorMessage = (response: BackendApiResponse<any>): string => {
  return response.error || response.message || 'Unknown error occurred';
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
