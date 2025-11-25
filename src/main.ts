import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ensureUploadsDirectory } from './config/create-uploads-dir';
import { AllExceptionsFilter } from './filters/http-exception.filter';

async function bootstrap() {
  // Ensure uploads directory exists
  ensureUploadsDirectory();

  const app = await NestFactory.create(AppModule);
  
  // Global error filter
  app.useGlobalFilters(new AllExceptionsFilter());
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();

