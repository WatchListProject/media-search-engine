import { Injectable } from '@nestjs/common';
import { MediaSearchEngineController, Movie, SearchMovieByNameRequest, SearchMovieByNameResponse } from './media_search_engine.pb';
import { Observable } from 'rxjs';
import { GrpcMethod } from '@nestjs/microservices';

@Injectable()
export class MediaService implements MediaSearchEngineController {
  private readonly movies: Movie[] = [
    { id: '1', title: 'The Matrix', overview: 'A computer hacker learns from mysterious rebels...', releaseDate: '1999-03-31', posterPath: '/poster_path.jpg', backdropPath: '/backdrop_path.jpg', popularity: 100 },
    { id: '2', title: 'Inception', overview: 'A thief who steals corporate secrets through the use of dream-sharing technology...', releaseDate: '2010-07-16', posterPath: '/poster_path.jpg', backdropPath: '/backdrop_path.jpg', popularity: 98 },
    { id: '3', title: 'Interstellar', overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival...', releaseDate: '2014-11-07', posterPath: '/poster_path.jpg', backdropPath: '/backdrop_path.jpg', popularity: 96 },
  ];

  @GrpcMethod('MediaSearchEngine', 'SearchMovieByName')
  searchMovieByName(request: SearchMovieByNameRequest): SearchMovieByNameResponse {
    const filteredMovies = this.movies.filter(movie => movie.title.toLowerCase().includes(request.name.toLowerCase()));
    return { movie: filteredMovies };
  }
}
