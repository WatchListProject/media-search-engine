import { Injectable } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Movie, SearchMovieByNameRequest, SearchMovieByNameResponse } from 'src/media_search_engine.pb';

@Injectable()
export class MovieService {
    private readonly MOVIES_BASE_URL = process.env.MOVIES_BASE_URL;
    private readonly MOVIES_TOKEN = process.env.MOVIES_TOKEN;
    private readonly MOVIES_POSTER_PATH = process.env.MOVIES_POSTER_PATH;



    async searchMovieByName(request: SearchMovieByNameRequest): Promise<SearchMovieByNameResponse> {

        // Build URL
        const moviesApiURL = `${this.MOVIES_BASE_URL}/search/movie?sort_by=popularity.desc&query=${request.name}&include_adult=true&language=en-US&page=1`;
        try {

            const requestConfig = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer ' + this.MOVIES_TOKEN
                }
            };

            const response = await fetch(moviesApiURL, requestConfig);
            const data = await response.json();

            const movieList: Movie[] = data.results.map(movie => ({
                title: movie.title,
                id: movie.id.toString(),
                overview: movie.overview,
                releaseDate: movie.release_date,
                posterPath: movie.poster_path ? `${this.MOVIES_POSTER_PATH}${movie.poster_path}` : null,
                backdropPath: movie.backdrop_path ? `${this.MOVIES_POSTER_PATH}${movie.backdrop_path}` : null,
                popularity: movie.popularity
            }));

            // order by popularity
            movieList.sort((a, b) => b.popularity - a.popularity);
            return { moviesList: movieList };

        } catch (error) {
            console.error('Error al obtener los datos:', error);
            throw(error);
        }
    }
}
