// src/modules/comments/dto/create-comment.dto.ts
// DTO for creating new comments - defines what data the comment creation endpoint accepts
// 创建新评论的DTO - 定义评论创建端点接受的数据结构

import { IsNotEmpty, IsString, Length, IsInt, Min } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'Comment content cannot be empty' })
  @IsString({ message: 'Comment content must be a string' })
  @Length(1, 1000, {
    message: 'Comment content must be between 1 and 1000 characters',
  })
  content: string;

  @IsNotEmpty({ message: 'Question ID is required' })
  @IsInt({ message: 'Question ID must be an integer' })
  @Min(1, { message: 'Question ID must be a positive number' })
  questionId: number;

  // Note: userId is automatically extracted from JWT token in the controller
  // 注意: userId在控制器中自动从JWT令牌提取
}
