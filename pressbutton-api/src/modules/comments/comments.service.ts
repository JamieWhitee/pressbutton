import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

/**
 * Comments Service - Business logic for comment operations
 * Handles CRUD operations for comments with proper validation
 * 评论服务 - 评论操作的业务逻辑，处理带有适当验证的CRUD操作
 */
@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get paginated comments for a specific question
   * 获取特定问题的分页评论
   * @param questionId - The ID of the question to get comments for
   * @param page - Page number (starting from 1)
   * @param limit - Number of comments per page (default: 10)
   * @returns Promise containing comments array and total count
   */
  async findByQuestionId(
    questionId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ comments: CommentResponseDto[]; total: number }> {
    // Validate pagination parameters
    // 验证分页参数
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    // Check if the question exists
    // 检查问题是否存在
    const questionExists = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!questionExists) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // Calculate pagination offset
    // 计算分页偏移量
    const skip = (page - 1) * limit;

    // Get total count of comments for this question
    // 获取此问题的评论总数
    const total = await this.prisma.comment.count({
      where: { questionId },
    });

    // Fetch paginated comments with user information
    // 获取带有用户信息的分页评论
    const commentsWithUser = await this.prisma.comment.findMany({
      where: { questionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Most recent comments first
      },
      skip,
      take: limit,
    });

    // Transform Prisma result to DTO format
    // 将Prisma结果转换为DTO格式
    const comments: CommentResponseDto[] = commentsWithUser.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        email: comment.user.email,
      },
      questionId: comment.questionId,
    }));

    return {
      comments,
      total,
    };
  }

  /**
   * Create a new comment
   * 创建新评论
   * @param createCommentDto - Comment data from request body
   * @param userId - User ID extracted from JWT token
   * @returns Promise containing the created comment
   */
  async create(
    createCommentDto: CreateCommentDto,
    userId: number,
  ): Promise<CommentResponseDto> {
    const { content, questionId } = createCommentDto;

    // Verify that the question exists before creating comment
    // 在创建评论之前验证问题是否存在
    const questionExists = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!questionExists) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // Verify that the user exists (should be guaranteed by JWT, but double-check)
    // 验证用户是否存在（JWT应该保证，但再次检查）
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Create the comment in database
    // 在数据库中创建评论
    const createdComment = await this.prisma.comment.create({
      data: {
        content,
        questionId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Transform to DTO format
    // 转换为DTO格式
    return {
      id: createdComment.id,
      content: createdComment.content,
      createdAt: createdComment.createdAt,
      updatedAt: createdComment.updatedAt,
      user: {
        id: createdComment.user.id,
        name: createdComment.user.name,
        email: createdComment.user.email,
      },
      questionId: createdComment.questionId,
    };
  }
}
