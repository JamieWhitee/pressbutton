import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 设为全局模块，其他模块直接注入 PrismaService 即可
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
