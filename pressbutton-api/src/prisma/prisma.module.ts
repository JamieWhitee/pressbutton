// src/prisma/prisma.module.ts
// This module makes PrismaService available to other modules
// It's like a "database connection provider" for your entire app

import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() means this module is available everywhere in your app
// You don't need to import PrismaModule in every other module
// Think of it as a "global utility" that everyone can use
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
