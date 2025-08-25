import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module'; // 如果 UsersService 里用到了 PrismaService

@Module({
  imports: [PrismaModule], // 如果用到 PrismaService，记得引入 PrismaModule
  controllers: [UsersController],
  providers: [UsersService], // 一定要有
  exports: [UsersService], // 如果给其他模块用，就导出
})
export class UsersModule {}
