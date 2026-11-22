import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS — gunakan env FRONTEND_URL agar tidak hardcode domain
  const allowedOrigins: (string | RegExp)[] = [
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
  } else {
    // Fallback: izinkan semua subdomain *.vercel.app hanya di non-production
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push(/\.vercel\.app$/);
    }
    console.warn('[CORS] FRONTEND_URL tidak di-set. Tambahkan ke .env atau Railway environment variables.');
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Serve static upload files
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 NestJS Backend Server running on: http://localhost:${port}/api`);
}
bootstrap();
