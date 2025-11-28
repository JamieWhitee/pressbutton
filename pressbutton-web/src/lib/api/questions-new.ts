/**
 * 📝 问题相关API封装
 *
 * 统一管理所有问题相关的API调用
 * - 获取问题列表 (全部、热门、随机、按作者)
 * - 创建问题
 * - 投票功能
 * - 问题详情和状态
 */

import { apiClient, API_ENDPOINTS } from '../api-client';

// ===========================================
// 类型定义
// ===========================================

export interface Question {
  id: number;
  positiveOutcome: string;
  negativeOutcome: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  author?: {
    id: number;
    name: string;
    email: string;
  };
  _count?: {
    votes: number;
    comments: number;
  };
  votes?: Vote[];
}

export interface Vote {
  id: number;
  choice: 'PRESS' | 'DONT_PRESS';
  userId: number;
  questionId: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

export interface CreateQuestionData {
  positiveOutcome: string;
  negativeOutcome: string;
}

export interface VoteRequest {
  vote: 'PRESS' | 'DONT_PRESS';
}

export interface VoteResponse {
  success: boolean;
  vote: Vote;
  message?: string;
}

export interface QuestionStatus {
  id: number;
  userHasVoted: boolean;
  userVoteChoice?: 'PRESS' | 'DONT_PRESS';
  totalVotes: number;
  pressVotes: number;
  dontPressVotes: number;
}

// ===========================================
// 问题API服务
// ===========================================

/**
 * 问题API服务类
 * 统一管理所有问题相关的API调用
 */
class QuestionsApiService {
  /**
   * 获取所有问题
   *
   * @returns 问题列表，按创建时间降序排列
   */
  async getAll(): Promise<Question[]> {
    try {
      const response = await apiClient.get<Question[]>(API_ENDPOINTS.QUESTIONS.ALL);
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch questions'
      );
    }
  }

  /**
   * 获取热门问题
   *
   * @returns 按投票数和评论数排序的热门问题列表
   */
  async getTop(): Promise<Question[]> {
    try {
      const response = await apiClient.get<Question[]>(API_ENDPOINTS.QUESTIONS.TOP);
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch top questions'
      );
    }
  }

  /**
   * 获取随机问题
   *
   * @returns 随机选择的问题
   */
  async getRandom(): Promise<Question> {
    try {
      const response = await apiClient.get<Question>(API_ENDPOINTS.QUESTIONS.RANDOM);
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch random question'
      );
    }
  }

  /**
   * 根据ID获取问题详情
   *
   * @param id 问题ID
   * @returns 问题详细信息，包括作者信息和统计数据
   */
  async getById(id: string): Promise<Question> {
    try {
      const response = await apiClient.get<Question>(API_ENDPOINTS.QUESTIONS.BY_ID(id));
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch question'
      );
    }
  }

  /**
   * 获取指定作者的问题
   *
   * @param authorId 作者用户ID
   * @returns 该作者创建的所有问题
   */
  async getByAuthor(authorId: string): Promise<Question[]> {
    try {
      const response = await apiClient.get<Question[]>(
        API_ENDPOINTS.QUESTIONS.BY_AUTHOR(authorId)
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch author questions'
      );
    }
  }

  /**
   * 创建新问题
   *
   * @param questionData 问题数据 (正面和负面结果)
   * @returns 创建的问题信息
   */
  async create(questionData: CreateQuestionData): Promise<Question> {
    try {
      const response = await apiClient.post<Question>(
        API_ENDPOINTS.QUESTIONS.CREATE,
        questionData
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to create question'
      );
    }
  }

  /**
   * 创建测试问题 (开发环境)
   *
   * @param questionData 问题数据
   * @returns 创建的测试问题信息
   */
  async createTest(questionData: CreateQuestionData): Promise<Question> {
    try {
      const response = await apiClient.post<Question>(
        API_ENDPOINTS.QUESTIONS.CREATE_TEST,
        questionData
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to create test question'
      );
    }
  }

  /**
   * 对问题进行投票
   *
   * @param questionId 问题ID
   * @param choice 投票选择 ('PRESS' 或 'DONT_PRESS')
   * @returns 投票结果
   */
  async vote(questionId: string, choice: 'PRESS' | 'DONT_PRESS'): Promise<VoteResponse> {
    try {
      const response = await apiClient.post<VoteResponse>(
        API_ENDPOINTS.QUESTIONS.VOTE(questionId),
        { vote: choice }
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to submit vote'
      );
    }
  }

  /**
   * 获取问题状态 (包括用户投票情况)
   *
   * @param questionId 问题ID
   * @returns 问题状态信息，包括投票统计
   */
  async getStatus(questionId: string): Promise<QuestionStatus> {
    try {
      const response = await apiClient.get<QuestionStatus>(
        API_ENDPOINTS.QUESTIONS.STATUS(questionId)
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch question status'
      );
    }
  }

  /**
   * 删除问题 (仅作者或管理员)
   *
   * @param questionId 问题ID
   * @returns 删除结果
   */
  async delete(questionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.QUESTIONS.DELETE,
        { questionId }
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete question'
      );
    }
  }
}

// 导出问题API服务实例
export const questionsApi = new QuestionsApiService();
