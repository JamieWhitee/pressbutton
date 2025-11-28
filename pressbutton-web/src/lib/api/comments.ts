/**
 * Comments API Service
 * Handles all comment-related API operations with unified client
 */

import { apiClient } from '../api-client';

// TypeScript interfaces for type safety
export interface Comment {
  id: string;
  content: string;
  userId: string;
  questionId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface CreateCommentRequest {
  content: string;
  questionId: string;
}

export interface UpdateCommentRequest {
  content?: string;
}

/**
 * Comments API Service Class
 * Provides all comment-related API operations
 */
class CommentsApiService {
  /**
   * 获取指定问题的所有评论
   * Get all comments for a specific question
   */
  async getByQuestion(questionId: string): Promise<Comment[]> {
    const response = await apiClient.get<Comment[]>(`/comments/question/${questionId}`);
    return response;
  }

  /**
   * 根据ID获取单个评论
   * Get a single comment by ID
   */
  async getById(commentId: string): Promise<Comment> {
    const response = await apiClient.get<Comment>(`/comments/${commentId}`);
    return response;
  }

  /**
   * 创建新评论
   * Create a new comment
   */
  async create(commentData: CreateCommentRequest): Promise<Comment> {
    const response = await apiClient.post<Comment>('/comments', commentData);
    return response;
  }

  /**
   * 更新评论内容
   * Update comment content
   */
  async update(commentId: string, commentData: UpdateCommentRequest): Promise<Comment> {
    const response = await apiClient.put<Comment>(`/comments/${commentId}`, commentData);
    return response;
  }

  /**
   * 删除评论
   * Delete a comment
   */
  async delete(commentId: string): Promise<void> {
    await apiClient.delete<void>(`/comments/${commentId}`);
  }

  /**
   * 获取用户的所有评论
   * Get all comments by a specific user
   */
  async getByUser(userId: string): Promise<Comment[]> {
    const response = await apiClient.get<Comment[]>(`/comments/user/${userId}`);
    return response;
  }
}

// Export singleton instance for use throughout the application
export const commentsApi = new CommentsApiService();

// Export the class for testing or advanced usage
export { CommentsApiService };
