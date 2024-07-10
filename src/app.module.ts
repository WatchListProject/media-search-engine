// src/app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MediaSearchEngineService } from './media-search-engine/media-search-engine.service';
import { MediaController } from './media/media.controller';
import { MediaService } from './media/media.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MEDIA_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'media',
          protoPath: join(__dirname, '../node_modules/protos/media_search_engine.proto'),
        },
      },
    ]),
  ],
  providers: [MediaSearchEngineService, MediaService],
  controllers: [MediaController],
})
export class AppModule {}
