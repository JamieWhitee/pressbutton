// src/modules/comments/dto/comment-response.dto.ts
// Response DTOs for comment data - used in API responses
// 评论数据的响应DTO - 用于API响应

/**
 * User information included in comment responses
 * 评论响应中包含的用户信息
 */
export class CommentUserDto {
  id: number;
  name: string | null;
  email: string;
}

/**
 * Data Transfer Object for comment responses
 * Used for API responses containing comment data
 * 用于包含评论数据的API响应的数据传输对象
 */
export class CommentResponseDto {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: CommentUserDto;
  questionId: number;
}
