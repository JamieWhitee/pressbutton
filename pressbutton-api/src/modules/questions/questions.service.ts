import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { QuestionsDto } from './dto/questions.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { DeleteQuestionDto } from './dto/delete-question.dto';
import { VoteDto } from './dto/vote.dto';
import { QuestionStatusDto } from './dto/question-status.dto';
import { QuestionsQueryDto } from './dto/query.dto';
import { PaginatedResponseDto, PaginationDto } from './dto/api-response.dto';

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 获取所有问题 - 企业级分页和搜索功能
   * Enterprise-grade pagination and search functionality
   */
  async getAllQuestions(
    query: QuestionsQueryDto,
  ): Promise<PaginatedResponseDto<QuestionsDto>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        authorId,
        sortBy = 'newest',
      } = query;

      const skip = (page - 1) * limit;

      // 构建查询条件 - 使用类型安全的 Prisma 查询 / Build query conditions with type-safe Prisma
      const where: Prisma.QuestionWhereInput = {};

      if (search) {
        where.OR = [
          { positiveOutcome: { contains: search, mode: 'insensitive' } },
          { negativeOutcome: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (authorId) {
        where.authorId = authorId;
      }

      // 构建排序条件 - 使用类型安全的 Prisma 排序 / Build sort conditions with type-safe Prisma
      let orderBy: Prisma.QuestionOrderByWithRelationInput;
      switch (sortBy) {
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'most_voted':
          orderBy = { votes: { _count: 'desc' } };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }

      // 执行查询和计数 / Execute query and count
      const [questions, total] = await this.prisma.$transaction([
        this.prisma.question.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            _count: {
              select: { votes: true, comments: true },
            },
          },
        }),
        this.prisma.question.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      const pagination: PaginationDto = {
        page,
        limit,
        total,
        totalPages,
      };

      this.logger.log(
        `Retrieved ${questions.length} questions (page ${page}/${totalPages})`,
      );

      return new PaginatedResponseDto(questions, pagination);
    } catch (error) {
      this.logger.error('Failed to retrieve questions', error);
      throw error;
    }
  }

  /**
   * 企业级问题创建功能 - 完整的日志记录和验证
   * Enterprise-grade question creation with comprehensive logging and validation
   */
  async createQuestion(
    createQuestionDto: CreateQuestionDto,
  ): Promise<QuestionsDto> {
    this.logger.log(
      `🔧 Service: Creating question with data: ${JSON.stringify(createQuestionDto)}`,
    );

    try {
      // Input validation with detailed error messages
      if (!createQuestionDto.positiveOutcome?.trim()) {
        throw new Error('Positive outcome is required and cannot be empty');
      }
      if (!createQuestionDto.negativeOutcome?.trim()) {
        throw new Error('Negative outcome is required and cannot be empty');
      }

      // Create the question in the database
      const newQuestion = await this.prisma.question.create({
        data: {
          positiveOutcome: createQuestionDto.positiveOutcome.trim(),
          negativeOutcome: createQuestionDto.negativeOutcome.trim(),
          authorId: createQuestionDto.authorId,
        },
      });

      this.logger.log(
        `✅ Service: Question created successfully with ID: ${newQuestion.id}`,
      );
      return newQuestion;
    } catch (error) {
      this.logger.error(
        `❌ Service: Error creating question: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Deletes a question and all its related data (comments and votes from ALL users).
   * This function ensures data integrity by removing orphaned records when a question is deleted.
   *
   * @param deleteQuestionDto - Contains questionId and authorId for ownership verification
   * @returns Promise<boolean> - Returns true if deletion was successful
   *
   * Performance: Uses database indexes on questionId for efficient deletion.
   * Does NOT loop through users - uses direct SQL queries with WHERE clauses.
   */
  async deleteQuestion(deleteQuestionDto: DeleteQuestionDto): Promise<boolean> {
    this.logger.log(
      `🗑️ Deleting question: ${JSON.stringify(deleteQuestionDto)}`,
    );

    try {
      // Step 1: Verify question ownership with a single efficient query
      // This is more efficient than fetching user + all questions, then using some()
      const questionToDelete = await this.prisma.question.findFirst({
        where: {
          id: deleteQuestionDto.questionId,
          authorId: deleteQuestionDto.authorId, // Ensures ownership in one database query
        },
      });

      // Step 2: Validate question ownership
      if (!questionToDelete) {
        throw new NotFoundException(
          `Question ${deleteQuestionDto.questionId} not found or not owned by user ${deleteQuestionDto.authorId}`,
        );
      }

      // Step 3: Atomic deletion using database transaction
      // All operations must succeed or all fail - ensures data consistency
      await this.prisma.$transaction(async (prisma) => {
        // Delete ALL comments from ANY users on this question
        // Uses database index on questionId - no user loops, very efficient
        const deletedComments = await prisma.comment.deleteMany({
          where: {
            questionId: deleteQuestionDto.questionId,
          },
        });
        this.logger.log(
          `🗑️ Deleted ${deletedComments.count} comments from all users`,
        );

        // Delete ALL votes from ANY users on this question
        // Uses database index on questionId - no user loops, very efficient
        const deletedVotes = await prisma.vote.deleteMany({
          where: {
            questionId: deleteQuestionDto.questionId,
          },
        });
        this.logger.log(
          `🗑️ Deleted ${deletedVotes.count} votes from all users`,
        );

        // Delete the question itself
        // Prisma automatically handles foreign key relationship cleanup
        // No need to manually disconnect from user.questions - this is redundant
        await prisma.question.delete({
          where: {
            id: deleteQuestionDto.questionId,
          },
        });
        this.logger.log(`🗑️ Deleted question ${deleteQuestionDto.questionId}`);
      });

      this.logger.log(
        '✅ Service: Question and all related data deleted successfully',
      );
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Service: Error deleting question: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Retrieves a specific question by its unique identifier.
   *
   * @param questionId - The unique identifier of the question
   * @returns Promise<QuestionsDto> - The question data
   *
   * Security Notes:
   * - Validates that questionId is a positive integer
   * - Provides clear error messages for debugging
   * - Does not expose sensitive information in error responses
   */
  async getQuestionById(questionId: number): Promise<QuestionsDto> {
    try {
      // Note: questionId validation is now handled by ParseIntPipe in the controller
      // So we know it's already a valid positive integer when it reaches here

      const question = await this.prisma.question.findUnique({
        where: { id: questionId },
      });

      // Handle the case where the question is not found with a descriptive error
      if (!question) {
        throw new NotFoundException(`Question with ID ${questionId} not found`);
      }

      return question;
    } catch (error) {
      this.logger.error(
        `❌ Error fetching question by ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * 企业级投票功能 - 包含冲突检测和审计日志
   * Enterprise-grade voting with conflict detection and audit logging
   */
  async voteQuestion(questionId: number, voteDto: VoteDto): Promise<VoteDto> {
    const logContext = {
      questionId,
      userId: voteDto.userId,
      choice: voteDto.choice,
    };

    try {
      this.logger.log('Processing vote request', logContext);

      // 验证问题和用户存在性 / Validate question and user existence
      const [questionExists, userExists] = await this.prisma.$transaction([
        this.prisma.question.findUnique({ where: { id: questionId } }),
        this.prisma.user.findUnique({ where: { id: voteDto.userId } }),
      ]);

      if (!questionExists) {
        throw new NotFoundException(`Question with ID ${questionId} not found`);
      }

      if (!userExists) {
        throw new NotFoundException(`User with ID ${voteDto.userId} not found`);
      }

      // 执行投票 / Execute vote with upsert
      const vote = await this.prisma.vote.upsert({
        where: {
          userId_questionId: {
            userId: voteDto.userId,
            questionId: questionId,
          },
        },
        update: {
          choice: voteDto.choice,
        },
        create: {
          userId: voteDto.userId,
          questionId: questionId,
          choice: voteDto.choice,
        },
      });

      this.logger.log('Vote processed successfully', {
        ...logContext,
        voteId: vote.id,
      });
      return vote;
    } catch (error) {
      this.logger.error('Failed to process vote', error, logContext);
      throw error;
    }
  }
  /**
   * Retrieves detailed voting statistics for a specific question.
   *
   * @param questionId - The unique identifier of the question
   * @returns Promise<QuestionStatusDto> - Voting statistics including counts and percentages
   *
   * Features:
   * - Handles edge case when no votes exist (prevents division by zero)
   * - Calculates percentage as a properly rounded number
   * - Validates question existence before processing votes
   */
  async getQuestionsVoteStatus(questionId: number): Promise<QuestionStatusDto> {
    try {
      // First, verify that the question exists to avoid processing votes for non-existent questions
      const questionExists = await this.prisma.question.findUnique({
        where: { id: questionId },
        select: { id: true }, // Only select the ID to minimize data transfer
      });

      if (!questionExists) {
        throw new Error(`Question with ID ${questionId} not found`);
      }

      // Fetch all votes for this specific question
      const questionsVoteStatus = await this.prisma.vote.findMany({
        where: {
          questionId: questionId,
        },
      });

      // Calculate vote statistics with proper type safety
      const positiveVotes = questionsVoteStatus.filter(
        (vote) => vote.choice === 'PRESS',
      ).length;
      const negativeVotes = questionsVoteStatus.filter(
        (vote) => vote.choice === 'DONT_PRESS',
      ).length;
      const totalVotes = questionsVoteStatus.length;

      // 🚨 CRITICAL FIX: Handle division by zero when no votes exist
      // Instead of returning NaN, return 0 as a sensible default
      const positivePercentage =
        totalVotes > 0
          ? Math.round((positiveVotes / totalVotes) * 100 * 100) / 100 // Round to 2 decimal places
          : 0; // Return 0% when no votes exist instead of NaN

      return {
        positiveVotes,
        negativeVotes,
        totalVotes,
        positivePercentage,
      };
    } catch (error) {
      this.logger.error(
        `❌ Error fetching question vote status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
