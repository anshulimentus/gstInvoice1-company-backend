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

  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(chalk.bgMagenta.white(`✅✅🧪✅✅ [${new Date().toISOString()}] ${req.method} ${req.url}`));
    next();
  });

  app.useGlobalPipes(new ValidationPipe());

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  app.enableCors({
    origin: [
      "https://gst-invoice-company-frontend.vercel.app",
      "http://localhost:5174",
      "https://gst-invoice-company-frontend-git-main-anshuls-projects-1ad701d0.vercel.app"
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", 'Authorization', 'x-tenant-id'],
    credentials: true,
  })

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  })

  app.use('/uploads/logos', express.static(join(__dirname, '..', 'uploads', 'logos')));

   // Configure static file serving - Make sure the path is absolute and correct
   const uploadPath = join(__dirname, '..', 'uploads');
  //  console.log(`📁 Serving static files from: ${uploadPath}`);


  await app.listen(3001);
  // console.log("✅ NestJs server running on http://localhost:3001");
}
bootstrap();




