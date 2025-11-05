import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NextFunction, Request, Response } from 'express';
import { ValidationPipe } from '@nestjs/common';
import * as chalk from 'chalk';
import { join } from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Request logging only in development
  if (process.env.NODE_ENV !== 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(
        chalk.bgMagenta.white(
          `✅✅🧪✅✅ [${new Date().toISOString()}] ${req.method} ${req.url}`,
        ),
      );
      next();
    });
  }

  app.useGlobalPipes(new ValidationPipe());

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // CORS configuration
  const corsOrigins =
    process.env.NODE_ENV === 'production'
      ? [
          'https://gst-invoice-company-frontend.vercel.app',
          'https://gst-invoice-company-frontend-git-main-anshuls-projects-1ad701d0.vercel.app',
        ]
      : [
          'https://gst-invoice-company-frontend.vercel.app',
          'https://gst-invoice-company-frontend-git-main-anshuls-projects-1ad701d0.vercel.app',
          'http://localhost:5173',
          'http://localhost:5174',
        ];

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.use(
    '/uploads/logos',
    express.static(join(__dirname, '..', 'uploads', 'logos')),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(
    `✅ App listening on port ${port} in ${process.env.NODE_ENV || 'development'} mode`,
  );
}
bootstrap();
