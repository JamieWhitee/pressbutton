import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { CommentsModule } from './modules/comments/comments.module';
// import { QuestionsService } from './questions/questions.service';
// Removed because the file does not exist, which caused a module not found error.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting - prevents brute force attacks
    // 速率限制 - 防止暴力攻击
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000, // Time window in milliseconds
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'), // Maximum requests per time window (increased for development)
      },
    ]),

    LoggerModule.forRoot({
      pinoHttp:
        process.env.NODE_ENV !== 'production'
          ? {
              transport: {
                target: 'pino-pretty',
                options: { colorize: true, singleLine: true },
              },
            }
          : undefined,
    }),
    //Connects everything: Makes your database service available throughout the app
    //Global access: Any future module can now use PrismaService
    //Clean architecture: Separates database concerns from business logic
    PrismaModule,
    AuthModule,
    QuestionsModule,
    CommentsModule, // Add comments module for comment operations
  ],
  providers: [
    // Apply rate limiting globally to all routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
