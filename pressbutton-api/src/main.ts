import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // 使用 Pino 日志（bufferLogs:true 可避免早期日志丢失）
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // 安全头
  // What helmet() actually does behind the scenes:
  /*
  Helmet sets these HTTP headers automatically:
  - X-Content-Type-Options: nosniff     // Prevents MIME sniffing attacks
  - X-Frame-Options: DENY               // Prevents clickjacking attacks
  - X-XSS-Protection: 1; mode=block     // Enables XSS filtering
  - Strict-Transport-Security: ...      // Forces HTTPS connections
  // Think of it as: "Put a security helmet on your API"
  // Just like wearing a helmet protects your head, these headers protect your API
  */
  app.use(helmet());

  // This configuration in your main.ts:
  app.enableCors({
    origin: true, // Which domains can call your API
    credentials: true, // Allow cookies/auth headers
  });

  // Real-world example:
  /*
  Your frontend runs on: http://localhost:3000
  Your backend runs on:  http://localhost:3001

  Without CORS configuration, browsers would BLOCK this request:
  - Frontend (3000) trying to call Backend (3001)
  - Browser says: "Different ports = different origins = BLOCKED!"

  CORS tells the browser: "Hey, it's okay to allow this cross-origin request"
  */

  // 全局校验/转换
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove fields not in your DTO
      transform: true, // Convert strings to numbers automatically
      forbidNonWhitelisted: false, // Don't throw error for extra fields
    }),
  );

  // What this means in practice:
  /*
  When user sends: { email: "test@test.com", password: "123456", hacker: "evil" }
  Validation pipe says: "I only know about email and password, removing 'hacker' field"
  Result: { email: "test@test.com", password: "123456" }
  */

  // 统一前缀与版本
  app.setGlobalPrefix('api');
  //app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Swagger
  const swaggerCfg = new DocumentBuilder()
    .setTitle('pressbutton API')
    .setDescription('API 文档')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup('/docs', app, doc);

  // 端口
  const cfg = app.get(ConfigService);
  const port = Number(cfg.get('PORT') ?? 3001);

  console.log(`🚀 API running at http://localhost:${port}`);
  console.log(`📘 Swagger at http://localhost:${port}/docs`);

  await app.listen(port);
}

void bootstrap();
