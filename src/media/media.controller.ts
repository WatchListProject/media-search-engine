import { Controller } from '@nestjs/common';
import { MediaSearchEngineController, SearchMovieByNameRequest, SearchMovieByNameResponse } from './media_search_engine.pb';
import { Observable } from 'rxjs';
import { GrpcMethod } from '@nestjs/microservices';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController implements MediaSearchEngineController{
    constructor(private readonly mediaService: MediaService) {}

    @GrpcMethod('MediaSearchEngine', 'SearchMovieByName')
    searchMovieByName(request: SearchMovieByNameRequest): SearchMovieByNameResponse | Promise<SearchMovieByNameResponse> | Observable<SearchMovieByNameResponse> {
        return this.mediaService.searchMovieByName(request);
    }
}
