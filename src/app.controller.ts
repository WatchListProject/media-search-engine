import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GetMediaByIdRequest, GetMediaByIdResponse, MediaSearchEngineController, SearchMovieByNameRequest, SearchMovieByNameResponse, SearchSerieByNameRequest, SearchSerieByNameResponse } from './media_search_engine.pb';
import { Observable } from 'rxjs';
import { SerieService } from './serie/serie.service';
import { MovieService } from './movie/movie.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Controller()
export class AppController implements MediaSearchEngineController {
  constructor(private readonly appService: AppService, private readonly serieService: SerieService, private readonly movieService: MovieService) { }
  @GrpcMethod('MediaSearchEngine', 'GetMediaById')
  getMediaById(request: GetMediaByIdRequest): Promise<GetMediaByIdResponse> {
    // Serie
    console.log(request);
    if (request.mediaType === "SERIE") {
      return this.serieService.getSerieById(request.mediaId);
    }
    // Movie
    if (request.mediaType === "MOVIE") {
      return this.movieService.getMovieById(request.mediaId);
    }
    throw new RpcException({ code: status.INTERNAL, message: `Error getting media by Id: MediaType '${request.mediaType}' doesnt exist` });
  }
  @GrpcMethod('MediaSearchEngine', 'SearchMovieByName')
  searchMovieByName(request: SearchMovieByNameRequest): Promise<SearchMovieByNameResponse> | Observable<SearchMovieByNameResponse> | SearchMovieByNameResponse {
    return this.movieService.searchMovieByName(request);
  }
  @GrpcMethod('MediaSearchEngine', 'SearchSerieByName')
  searchSerieByName(request: SearchSerieByNameRequest): Promise<SearchSerieByNameResponse> | Observable<SearchSerieByNameResponse> | SearchSerieByNameResponse {
    return this.serieService.searchSerieByName(request);
  }

}

