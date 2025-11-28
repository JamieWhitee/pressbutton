/**
 * 🌐 PressButton API 统一入口
 *
 * 导出所有API服务，提供统一的API调用接口
 * 使用方式：
 * import { authApi, questionsApi, commentsApi } from '@/lib/api';
 */

// 导出所有API服务
export { authApi } from './auth';
export { questionsApi } from './questions-new';
export { commentsApi } from './comments';

// 导出基础API客户端和配置
export { apiClient, API_ENDPOINTS } from '../api-client';
export { API_BASE_URL, ENV_INFO } from '../config';

// 导出类型定义
export type { LoginRequest, RegisterRequest, User, AuthResponse } from './auth';
export type { Question, Vote, CreateQuestionData, VoteRequest, VoteResponse, QuestionStatus } from './questions-new';
export type { Comment, CreateCommentRequest, UpdateCommentRequest } from './comments';

// ===========================================
// 便捷的组合API调用
// ===========================================

/**
 * 获取问题及其评论 (组合调用)
 */
export async function getQuestionWithComments(questionId: string) {
  const { questionsApi } = await import('./questions-new');
  const { commentsApi } = await import('./comments');

  const [question, comments] = await Promise.all([
    questionsApi.getById(questionId),
    commentsApi.getByQuestion(questionId)
  ]);

  return { question, comments };
}

/**
 * 检查API健康状况
 */
export async function checkApiHealth() {
  const { apiClient } = await import('../api-client');
  return apiClient.healthCheck();
}
