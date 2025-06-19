import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
import { SwaggerModule } from '@nestjs/swagger/dist/swagger-module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    disableErrorMessages: false,
  }));

  app.enableCors({
    origin: ['http://localhost:5173', 'https://frontend-weather-app.onrender.com'],
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const config = new DocumentBuilder()
    .setTitle('Weather API')
    .setDescription('API do pobierania danych pogodowych i obliczeń energii słonecznej')
    .setVersion('1.0')
    .addTag('weather', 'Operacje związane z pogodą')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
}
bootstrap();
