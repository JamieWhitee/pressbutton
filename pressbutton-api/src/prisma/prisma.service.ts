// src/prisma/prisma.service.ts
// This service provides database access throughout your application
// Think of it as the "database gateway" that all your modules will use
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/*
extends PrismaClient:

Your service inherits all database methods (findMany, create, update, etc.)
Like getting superpowers from Prisma!
implements OnModuleInit, OnModuleDestroy:

Tells NestJS "run my code when app starts/stops"
Ensures proper database connection lifecycle
onModuleInit():

Automatically connects to your pressbutton_dev database
Runs once when your app starts
onModuleDestroy():
Cleanly closes database connections
Prevents memory leaks when app shuts down
*/
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('💾 Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('💾 Database disconnected successfully');
  }
}
