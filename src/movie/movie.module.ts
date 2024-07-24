import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';

@Module({
  providers: [MovieService],
  controllers: []
})
export class MovieModule {}
