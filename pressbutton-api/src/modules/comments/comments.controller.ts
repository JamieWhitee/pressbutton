import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import {
  ApiResponseDto,
  PaginatedResponseDto,
} from '../questions/dto/api-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

/**
 * Comments Controller - REST API endpoints for comment operations
 * All endpoints require JWT authentication (including guest users)
 * 评论控制器 - 评论操作的REST API端点，所有端点都需要JWT认证（包括快速用户）
 */
@ApiTags('Comments')
@Controller('comments')
@UseGuards(JwtAuthGuard) // All comment operations require authentication
@ApiBearerAuth() // Swagger documentation shows Bearer token requirement
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * Get paginated comments for a specific question
   * GET /api/comments/question/:questionId
   * 获取特定问题的分页评论
   */
  @Get('question/:questionId')
  @ApiOperation({
    summary: 'Get comments for a question',
    description:
      'Retrieve paginated comments for a specific question. Requires authentication.',
  })
  @ApiParam({
    name: 'questionId',
    description: 'ID of the question to get comments for',
    type: 'integer',
    example: 1,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number (starting from 1)',
    type: 'integer',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of comments per page (max 100)',
    type: 'integer',
    example: 10,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: PaginatedResponseDto<CommentResponseDto>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Question not found',
  })
  async getQuestionComments(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedResponseDto<CommentResponseDto>> {
    // Get comments and total count from service
    // 从服务获取评论和总数
    const result = await this.commentsService.findByQuestionId(
      questionId,
      page,
      limit,
    );

    // Calculate pagination metadata
    // 计算分页元数据
    const totalPages = Math.ceil(result.total / limit);

    // Return paginated response using enterprise DTO format
    // 使用企业DTO格式返回分页响应
    return new PaginatedResponseDto(
      result.comments,
      {
        page,
        limit,
        total: result.total,
        totalPages,
      },
      'Comments retrieved successfully',
    );
  }

  /**
   * Create a new comment
   * POST /api/comments
   * 创建新评论
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new comment',
    description:
      'Create a new comment on a question. User ID is automatically extracted from JWT token.',
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: ApiResponseDto<CommentResponseDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Question not found',
  })
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: { user: { id: number } },
  ): Promise<ApiResponseDto<CommentResponseDto>> {
    // Extract user ID from JWT token (provided by JwtAuthGuard)
    // 从JWT令牌提取用户ID（由JwtAuthGuard提供）
    const userId: number = req.user.id;

    // Create comment using service
    // 使用服务创建评论
    const comment = await this.commentsService.create(createCommentDto, userId);

    // Return success response using enterprise DTO format
    // 使用企业DTO格式返回成功响应
    return ApiResponseDto.success(comment, 'Comment created successfully');
  }
}
