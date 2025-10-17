import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Fix for Node.js 18 crypto issue
import { webcrypto } from 'crypto';
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Oniki.net API')
    .setDescription('AI-powered network matchmaking platform API documentation')
    .setVersion('1.0.0')
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User profile management')
    .addTag('Events', 'Event management and participation')
    .addTag('Matches', 'AI-powered matching system')
    .addTag('Messages', 'Real-time messaging')
    .addTag('Meetings', 'Meeting scheduler')
    .addTag('Analytics', 'Platform analytics and insights')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📚 API available at http://localhost:${port}/api`);
  console.log(`📖 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();

