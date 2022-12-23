import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app/app.config.service';
import { ProductionDataModule } from './models/operations/production-data.module';
import { UsersModule } from './models/users/users.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn', 'debug', 'verbose'] });
  const logger = new Logger('bootstrap function');
  const config = app.get(AppConfigService);

  const port = config.API_PORT;
  const withSwagger = config.WITH_SWAGGER;

  if (withSwagger) {
    const docBuilder = new DocumentBuilder()
      .setTitle('Nijkamp API')
      .setDescription('Nijkamp API')
      .setVersion('0.1')
      .addTag('user')
      .addTag('production-data')
      .build();
    const doc = SwaggerModule.createDocument(app, docBuilder, { include: [UsersModule, ProductionDataModule] });
    SwaggerModule.setup('api', app, doc);
    logger.log('Swagger is enabled');
  } else {
    logger.log('Swagger is disabled');
  }
  await app.listen(port);
  logger.log(`App is listening on port ${port}`);
}

bootstrap();
