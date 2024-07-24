import { Module } from '@nestjs/common';
import { SerieService } from './serie.service';

@Module({
  providers: [SerieService],
  controllers: []
})
export class SerieModule {}
