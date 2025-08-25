import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  // 使用 Pino 日志（bufferLogs:true 可避免早期日志丢失）
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // 安全头
  app.use(helmet());

  // CORS（按需收紧）
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 全局校验/转换
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 丢弃 DTO 之外的字段
      transform: true, // 自动类型转换
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 统一前缀与版本
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

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
  //await app.listen(port);
  console.log(`🚀 API running at http://localhost:${port}`);
  console.log(`📘 Swagger at http://localhost:${port}/docs`);
  const prisma = app.get(PrismaService);
  prisma.enableShutdownHooks(app);

  await app.listen(port);
}
bootstrap();
