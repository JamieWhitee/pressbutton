import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Comments Module - Groups comment-related components
 * Handles all comment operations including viewing and creating comments
 * 评论模块 - 组合评论相关组件，处理所有评论操作，包括查看和创建评论
 */
@Module({
  imports: [
    PrismaModule, // Import Prisma module for database access
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService], // Export service for potential use in other modules
})
export class CommentsModule {}
