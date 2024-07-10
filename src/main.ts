// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'media',
      url: '0.0.0.0:5002',
      protoPath: join(__dirname, '../node_modules/protos/media_search_engine.proto'),
    },
  });
  await app.listen();
}
bootstrap();
