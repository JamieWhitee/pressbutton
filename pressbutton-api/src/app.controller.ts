import { Controller, Get, Version } from '@nestjs/common';

@Controller('health') // ✅ 只写相对路径
export class AppController {
  getHello(): any {
    throw new Error('Method not implemented.');
  }
  @Version('1') // ✅ 由全局 URI 版本机制拼成 /api/v1/health
  @Get()
  health() {
    return { status: 'ok', ts: new Date().toISOString() };
  }
}
