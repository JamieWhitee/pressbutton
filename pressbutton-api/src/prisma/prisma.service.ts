import {
  Injectable,
  INestApplication,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    // 应用启动时连库（单元测试/热重载时很有用）
    await this.$connect();
  }

  async onModuleDestroy() {
    // 应用关闭时断开连接
    await this.$disconnect();
  }

  // 优雅关闭：让 Prisma 跟着 Nest 一起收尾
  enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', () => {
      // 不要返回 promise，使用 void 丢弃即可，避免 ESLint 警告
      void app.close();
    });
  }
}
