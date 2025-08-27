import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting - prevents brute force attacks
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time window in milliseconds (60 seconds)
        limit: 10, // Maximum requests per time window
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
