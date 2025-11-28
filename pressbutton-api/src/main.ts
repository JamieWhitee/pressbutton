import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Create NestJS application with Pino logger for better performance
  // bufferLogs: true prevents early log messages from being lost
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // Security headers - Helmet automatically sets these HTTP headers:
  // - X-Content-Type-Options: nosniff (prevents MIME sniffing attacks)
  // - X-Frame-Options: DENY (prevents clickjacking attacks)
  // - X-XSS-Protection: 1; mode=block (enables XSS filtering)
  // - Strict-Transport-Security: ... (forces HTTPS connections)
  app.use(helmet());

  // Get ConfigService for environment variables
  const configService = app.get(ConfigService);

  // CORS configuration allows cross-origin requests
  // Without this, browsers would block requests from frontend to backend
  const corsOrigin = configService.get('CORS_ORIGIN') || '*';
  app.enableCors({
    origin: corsOrigin, // Allow specific origin from env or all origins
    credentials: true, // Allow cookies and auth headers
  });

  // Global validation pipe automatically validates incoming requests
  // whitelist: true - removes unknown properties from request body
  // transform: true - converts string numbers to actual numbers
  // forbidNonWhitelisted: false - allows extra fields without throwing errors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Set global prefix for all routes (e.g., /api/auth/login)
  app.setGlobalPrefix('api');

  // Swagger API documentation configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('PressButton API')
    .setDescription('API documentation for PressButton application')
    .setVersion('1.0.0')
    .addBearerAuth() // Enable JWT Bearer token authentication in Swagger UI
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/docs', app, document);

  // Get port from environment variables or default to 3001
  const port = Number(configService.get('PORT') ?? 3001);

  // Log startup information
  console.log(`🚀 API running at http://localhost:${port}`);
  console.log(`📘 Swagger documentation at http://localhost:${port}/docs`);
  console.log('Database connected successfully');

  // Start the application
  await app.listen(port);
}

// Call bootstrap function and handle any errors
void bootstrap();
