import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { QuestionsDto } from './dto/questions.dto';
import { CreateQuestionAuthDto } from './dto/create-question-auth.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { DeleteQuestionDto } from './dto/delete-question.dto';
import { VoteDto } from './dto/vote.dto';
import { VoteChoiceDto } from './dto/vote-choice.dto';
import { QuestionStatusDto } from './dto/question-status.dto';
import { QuestionsQueryDto } from './dto/query.dto';
import { PaginatedResponseDto, ApiResponseDto } from './dto/api-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

// Interface for authenticated request with user data from JWT
// 包含JWT用户数据的认证请求接口
interface AuthenticatedRequest {
  user: {
    id: number;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

@ApiTags('questions') // Groups endpoints in Swagger UI
@Controller('questions')
export class QuestionsController {
  private readonly logger = new Logger(QuestionsController.name);

  constructor(private readonly questionsService: QuestionsService) {}

  @Get('top')
  @ApiOperation({
    summary: 'Get top questions by vote count',
    description:
      'Retrieves the most popular questions ordered by total vote count (descending)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of questions to return',
    example: 15,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Top questions retrieved successfully',
    type: ApiResponseDto,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        error: 'Internal server error',
        data: null,
      },
    },
  })
  async getTopQuestions(
    @Query('limit') limit?: string,
  ): Promise<{ success: boolean; data: any; error?: string }> {
    try {
      this.logger.log('🔥 Controller: GET /questions/top endpoint hit');

      // Parse and validate limit parameter (default to 15)
      const parsedLimit = limit ? parseInt(limit, 10) : 15;
      const validLimit = Math.min(Math.max(parsedLimit, 1), 50); // Clamp between 1-50

      this.logger.log(`📊 Controller: Fetching top ${validLimit} questions`);

      const topQuestions = await this.questionsService.getTopQuestions(
        validLimit,
      );

      this.logger.log(
        `✅ Controller: Successfully retrieved ${topQuestions.length} top questions`,
      );

      return {
        success: true,
        data: topQuestions,
      };
    } catch (error) {
      this.logger.error('❌ Controller: Failed to get top questions', error);
      return {
        success: false,
        error: 'Failed to retrieve top questions',
        data: null,
      };
    }
  }

  @Get('random')
  @ApiOperation({
    summary: 'Get a random question',
    description:
      'Retrieves a random question. If userId is provided, excludes questions the user has already voted on.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Optional user ID to exclude already voted questions',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Random question found successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No available questions found',
    schema: {
      example: {
        success: false,
        message: 'No available questions found',
        error: 'No questions available for this user',
        timestamp: '2025-09-03T10:00:00.000Z',
      },
    },
  })
  async getRandomQuestion(
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
  ): Promise<ApiResponseDto<QuestionsDto>> {
    try {
      const randomQuestion =
        await this.questionsService.getRandomQuestion(userId);

      if (!randomQuestion) {
        throw new NotFoundException(
          'No available questions found for this user',
        );
      }

      return ApiResponseDto.success(
        randomQuestion,
        'Random question retrieved successfully',
      );
    } catch (error) {
      this.logger.error(
        `❌ Controller: Error fetching random question: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all questions with pagination and search',
    description:
      'Retrieves questions with enterprise-grade pagination, search, and filtering capabilities',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'money' })
  @ApiQuery({ name: 'authorId', required: false, example: 1 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'newest' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved questions with pagination',
    type: PaginatedResponseDto,
  })
  async getAllQuestions(
    @Query() query: QuestionsQueryDto,
  ): Promise<PaginatedResponseDto<QuestionsDto>> {
    return this.questionsService.getAllQuestions(query);
  }

  @Get('author/:id')
  @ApiOperation({
    summary:
      'Get questions by author ID (Deprecated - Use /all with authorId param)',
    description:
      'This endpoint is deprecated. Use GET /all?authorId=:id instead for better pagination and filtering.',
    deprecated: true,
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the author',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved questions by author',
    type: PaginatedResponseDto,
  })
  async getQuestionsByAuthor(
    @Param('id', ParseIntPipe) authorId: number,
  ): Promise<PaginatedResponseDto<QuestionsDto>> {
    // 重构：使用统一的 getAllQuestions 方法，避免代码重复
    // Refactor: Use unified getAllQuestions method to avoid code duplication
    const query: QuestionsQueryDto = {
      authorId,
      page: 1,
      limit: 100, // 为了向后兼容，返回更多数据
    };

    return this.questionsService.getAllQuestions(query);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new question (Authentication Required)',
    description:
      'Creates a new question with positive and negative outcomes for the button press game. Requires valid JWT token. The author will be automatically set to the authenticated user.',
  })
  @ApiBody({
    type: CreateQuestionAuthDto,
    description:
      'Question data with positive and negative outcomes. Author is automatically set from JWT token.',
    examples: {
      example1: {
        summary: 'Sample English question',
        value: {
          positiveOutcome: 'You will gain superpowers and save the world',
          negativeOutcome: 'You will lose all your memories of loved ones',
        },
      },
      example2: {
        summary: 'Sample Chinese question',
        value: {
          positiveOutcome: '你将获得全世界的财富和权力',
          negativeOutcome: '你将永远无法再见到你最爱的人',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Question created successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Validation failed - Check that all required fields are provided and meet the minimum length requirements',
    schema: {
      example: {
        message: [
          'Positive outcome must be at least 5 characters long',
          'Negative outcome cannot be empty',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token is missing or invalid',
    schema: {
      example: {
        message: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  async createQuestionByAuthor(
    @Body() createQuestionAuthDto: CreateQuestionAuthDto,
    @Request() req: { user: { id: number; email: string; name: string } },
  ): Promise<ApiResponseDto<QuestionsDto>> {
    try {
      // Create the full DTO with author ID from JWT token
      // 从JWT令牌中创建包含作者ID的完整DTO
      const createQuestionDto: CreateQuestionDto = {
        positiveOutcome: createQuestionAuthDto.positiveOutcome,
        negativeOutcome: createQuestionAuthDto.negativeOutcome,
        authorId: req.user.id, // Get author ID from authenticated user
      };

      const newQuestion =
        await this.questionsService.createQuestion(createQuestionDto);
      return ApiResponseDto.success(newQuestion);
    } catch (error) {
      this.logger.error(
        `❌ Controller: Error creating question: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  @Post('create-test')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new question (Development Testing - No Auth Required)',
    description:
      'DEVELOPMENT ONLY: Creates a new question without authentication for testing purposes. In production, this endpoint should be removed.',
    tags: ['Development Testing'],
  })
  @ApiBody({
    type: CreateQuestionDto,
    description:
      'Question data including positive outcome, negative outcome, and author ID for testing',
    examples: {
      testExample: {
        summary: 'Development test question',
        value: {
          positiveOutcome: 'You will have the power to read minds',
          negativeOutcome:
            "You cannot turn it off and hear everyone's thoughts",
          authorId: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Question created successfully (testing)',
    type: ApiResponseDto,
  })
  async createQuestionForTesting(
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<ApiResponseDto<QuestionsDto>> {
    try {
      this.logger.warn(
        '⚠️ DEVELOPMENT: Using test endpoint for question creation',
        { authorId: createQuestionDto.authorId },
      );

      const newQuestion =
        await this.questionsService.createQuestion(createQuestionDto);
      return ApiResponseDto.success(newQuestion);
    } catch (error) {
      this.logger.error(
        `❌ Controller: Error creating test question: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  @Delete('delete')
  @ApiOperation({
    summary: 'Delete a question and all related data',
    description:
      'Deletes a question owned by the specified author along with ALL related comments and votes from ANY users. This operation is irreversible and will clean up all orphaned data to maintain database integrity.',
  })
  @ApiBody({
    type: DeleteQuestionDto,
    description:
      'Delete request containing question ID and author ID for ownership verification',
    examples: {
      example1: {
        summary: 'Delete question example',
        value: {
          questionId: 1,
          authorId: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Question and all related data deleted successfully',
    schema: {
      example: true,
      type: 'boolean',
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Validation failed - Check that questionId and authorId are valid numbers',
    schema: {
      example: {
        message: [
          'Question ID is required',
          'Question ID must be a number',
          'Author ID must be a number',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description:
      'Question not found or does not belong to the specified author',
    schema: {
      example: {
        message: 'Question 123 not found or not owned by user 456',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during deletion process',
    schema: {
      example: {
        message: 'Database transaction failed',
        error: 'Internal Server Error',
        statusCode: 500,
      },
    },
  })
  async deleteQuestionByAuthor(
    @Body() deleteQuestionDto: DeleteQuestionDto,
  ): Promise<boolean> {
    // Enhanced logging to track deletion requests for auditing purposes
    this.logger.log(
      `🗑️ Delete request received: ${JSON.stringify({
        questionId: deleteQuestionDto.questionId,
        authorId: deleteQuestionDto.authorId,
        timestamp: new Date().toISOString(),
      })}`,
    );

    try {
      // Delegate to service layer which handles:
      // 1. Ownership verification
      // 2. Atomic deletion of comments, votes, and question
      // 3. Database transaction management
      const deletionResult =
        await this.questionsService.deleteQuestion(deleteQuestionDto);

      this.logger.log(
        '✅ Controller: Question deletion completed successfully',
      );
      return deletionResult;
    } catch (error) {
      // Log error details for debugging while keeping user-facing error clean
      this.logger.error('❌ Controller: Question deletion failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        questionId: deleteQuestionDto.questionId,
        authorId: deleteQuestionDto.authorId,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get question by ID',
    description: 'Retrieves a specific question by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the question',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Question found successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Question not found',
    schema: {
      example: {
        success: false,
        message: 'Question not found',
        error: 'Question with ID 123 not found',
        timestamp: '2025-09-02T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid question ID format',
    schema: {
      example: {
        success: false,
        message: 'Invalid question ID format',
        error: 'Bad Request',
        timestamp: '2025-09-02T10:00:00.000Z',
      },
    },
  })
  async getQuestionById(
    @Param('id', ParseIntPipe) questionId: number,
  ): Promise<ApiResponseDto<QuestionsDto>> {
    // ✅ ParseIntPipe automatically:
    // 1. Converts string "123" to number 123
    // 2. Validates it's a valid integer
    // 3. Throws 400 Bad Request if invalid (e.g., "abc", "12.5", negative numbers)
    // 4. No manual validation needed!

    try {
      const question = await this.questionsService.getQuestionById(questionId);
      // ✅ Enterprise Standard: Wrap response in unified ApiResponseDto format
      // 企业标准：将响应包装在统一的ApiResponseDto格式中
      return ApiResponseDto.success(
        question,
        'Question retrieved successfully',
      );
    } catch (error) {
      this.logger.error(
        `❌ Controller: Error fetching question: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard) // 🔒 Require JWT authentication / 需要JWT认证
  @ApiBearerAuth() // 📖 Document JWT requirement in Swagger / 在Swagger中记录JWT需求
  @ApiOperation({
    summary: 'Vote on a question',
    description:
      'Submit a vote (PRESS or DONT_PRESS) for a specific question. Users can change their vote anytime. Requires authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the question to vote on',
    example: 1,
    type: 'number',
  })
  @ApiBody({
    type: VoteChoiceDto,
    description: 'Vote choice (user ID automatically extracted from JWT token)',
    examples: {
      pressVote: {
        summary: 'Vote to press the button',
        value: {
          choice: 'PRESS',
        },
      },
      dontPressVote: {
        summary: 'Vote not to press the button',
        value: {
          choice: 'DONT_PRESS',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Vote submitted successfully',
    type: ApiResponseDto<VoteDto>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
    schema: {
      example: {
        message: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      example: {
        message: ['Choice must be PRESS or DONT_PRESS'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Question not found',
    schema: {
      example: {
        message: 'Question with ID 123 not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async voteOnQuestion(
    @Param('id', ParseIntPipe) questionId: number,
    @Body() voteChoiceDto: VoteChoiceDto,
    @Request() req: AuthenticatedRequest, // Contains user info from JWT / 包含来自JWT的用户信息
  ): Promise<ApiResponseDto<VoteDto>> {
    // ✅ ParseIntPipe automatically handles string-to-number conversion and validation
    // No manual parsing needed - NestJS does it for us!
    // 🔐 User ID is automatically extracted from JWT token via JwtAuthGuard
    // JWT守卫自动从JWT令牌中提取用户ID

    try {
      // Extract user ID from JWT token (populated by JwtStrategy.validate())
      // 从JWT令牌中提取用户ID（由JwtStrategy.validate()填充）
      const userId = req.user.id;

      // Create complete VoteDto with user ID from token and choice from request
      // 创建完整的VoteDto，用户ID来自令牌，选择来自请求
      const voteDto: VoteDto = {
        userId: userId,
        choice: voteChoiceDto.choice,
      };

      const vote = await this.questionsService.voteQuestion(
        questionId,
        voteDto,
      );

      return ApiResponseDto.success(vote, 'Vote submitted successfully');
    } catch (error) {
      this.logger.error(
        `❌ Controller: Error processing vote: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  @Get(':id/status')
  @ApiOperation({
    summary: 'Get voting statistics for a question',
    description:
      'Retrieves detailed voting statistics including vote counts and percentages for a specific question',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the question',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Voting statistics retrieved successfully',
    type: QuestionStatusDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Question not found',
    schema: {
      example: {
        message: 'Question with ID 123 not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid question ID format',
    schema: {
      example: {
        message: 'Invalid question ID format',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async getQuestionStatus(
    @Param('id', ParseIntPipe) questionId: number,
  ): Promise<QuestionStatusDto> {
    // ✅ ParseIntPipe automatically handles string-to-number conversion and validation
    // Ensures questionId is a valid positive integer before reaching our service

    try {
      const status =
        await this.questionsService.getQuestionsVoteStatus(questionId);
      return status;
    } catch (error) {
      this.logger.error(
        `❌ Controller: Error fetching question status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
