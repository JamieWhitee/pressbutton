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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { QuestionsDto } from './dto/questions.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { DeleteQuestionDto } from './dto/delete-question.dto';
import { VoteDto } from './dto/vote.dto';
import { QuestionStatusDto } from './dto/question-status.dto';
import { QuestionsQueryDto } from './dto/query.dto';
import { PaginatedResponseDto, ApiResponseDto } from './dto/api-response.dto';

@ApiTags('questions') // Groups endpoints in Swagger UI
@Controller('questions')
export class QuestionsController {
  private readonly logger = new Logger(QuestionsController.name);

  constructor(private readonly questionsService: QuestionsService) {}

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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new question',
    description:
      'Creates a new question with positive and negative outcomes for the button press game. All fields are required and will be validated.',
  })
  @ApiBody({
    type: CreateQuestionDto,
    description:
      'Question data including positive outcome, negative outcome, and author ID',
    examples: {
      example1: {
        summary: 'Sample English question',
        value: {
          positiveOutcome: 'You will gain superpowers and save the world',
          negativeOutcome: 'You will lose all your memories of loved ones',
          authorId: 1,
        },
      },
      example2: {
        summary: 'Sample Chinese question',
        value: {
          positiveOutcome: '你将获得全世界的财富和权力',
          negativeOutcome: '你将永远无法再见到你最爱的人',
          authorId: 1,
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
          'Author ID must be a number',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async createQuestionByAuthor(
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<ApiResponseDto<QuestionsDto>> {
    try {
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
    type: QuestionsDto,
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
  async getQuestionById(
    @Param('id', ParseIntPipe) questionId: number,
  ): Promise<QuestionsDto> {
    // ✅ ParseIntPipe automatically:
    // 1. Converts string "123" to number 123
    // 2. Validates it's a valid integer
    // 3. Throws 400 Bad Request if invalid (e.g., "abc", "12.5", negative numbers)
    // 4. No manual validation needed!

    try {
      const question = await this.questionsService.getQuestionById(questionId);
      return question;
    } catch (error) {
      this.logger.error(
        `❌ Controller: Error fetching question: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  @Post(':id/vote')
  @ApiOperation({
    summary: 'Vote on a question',
    description:
      'Submit a vote (PRESS or DONT_PRESS) for a specific question. Users can change their vote anytime.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the question to vote on',
    example: 1,
    type: 'number',
  })
  @ApiBody({
    type: VoteDto,
    description: 'Vote data containing user ID and choice',
    examples: {
      pressVote: {
        summary: 'Vote to press the button',
        value: {
          userId: 1,
          choice: 'PRESS',
        },
      },
      dontPressVote: {
        summary: 'Vote not to press the button',
        value: {
          userId: 1,
          choice: 'DONT_PRESS',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Vote submitted successfully',
    type: VoteDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      example: {
        message: [
          'User ID must be a number',
          'Choice must be PRESS or DONT_PRESS',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Question or user not found',
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
    @Body() voteDto: VoteDto,
  ): Promise<VoteDto> {
    // ✅ ParseIntPipe automatically handles string-to-number conversion and validation
    // No manual parsing needed - NestJS does it for us!

    try {
      const vote = await this.questionsService.voteQuestion(
        questionId,
        voteDto,
      );
      return vote;
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
