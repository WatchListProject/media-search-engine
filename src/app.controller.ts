import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MediaSearchEngineController, SearchMovieByNameRequest, SearchMovieByNameResponse, SearchSerieByNameRequest, SearchSerieByNameResponse } from './media_search_engine.pb';
import { Observable } from 'rxjs';
import { SerieService } from './serie/serie.service';
import { MovieService } from './movie/movie.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AppController implements MediaSearchEngineController{
  constructor(private readonly appService: AppService, private readonly serieService: SerieService, private readonly movieService: MovieService) { }
  @GrpcMethod('MediaSearchEngine', 'SearchMovieByName')
  searchMovieByName(request: SearchMovieByNameRequest): Promise<SearchMovieByNameResponse> | Observable<SearchMovieByNameResponse> | SearchMovieByNameResponse {
    return this.movieService.searchMovieByName(request);
  }
  @GrpcMethod('MediaSearchEngine', 'SearchSerieByName')
  searchSerieByName(request: SearchSerieByNameRequest): Promise<SearchSerieByNameResponse> | Observable<SearchSerieByNameResponse> | SearchSerieByNameResponse {
    return this.serieService.searchSerieByName(request);
  }

}
