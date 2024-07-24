// src/app.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MovieModule } from './movie/movie.module';
import { MovieService } from './movie/movie.service';
import { SerieModule } from './serie/serie.module';
import { SerieService } from './serie/serie.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
    MovieModule,
    SerieModule,
  ],
  providers: [ AppService, MovieService, SerieService],
  controllers: [ AppController],
})
export class AppModule {}
