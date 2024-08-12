import { status } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { GetMediaByIdResponse, Movie, SearchMovieByNameRequest, SearchMovieByNameResponse } from 'src/media_search_engine.pb';

@Injectable()
export class MovieService {

    private readonly MOVIES_BASE_URL = process.env.MOVIES_BASE_URL;
    private readonly MOVIES_TOKEN = process.env.MOVIES_TOKEN;
    private readonly MOVIES_POSTER_PATH = process.env.MOVIES_POSTER_PATH;
    private readonly MOVIES_API_KEY = process.env.MOVIES_API_KEY;


    async getMovieById(mediaId: string): Promise<GetMediaByIdResponse> {

        try {
            const moviesApiURL = `${this.MOVIES_BASE_URL}/movie/${mediaId}?language=en-US&${this.MOVIES_API_KEY}`;
            const requestConfig = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer ' + this.MOVIES_TOKEN
                }
            };

            const response = await fetch(moviesApiURL, requestConfig);
            const data = await response.json();
            if (data.id === "" || data.id === undefined) {
                throw new RpcException({ code: status.INVALID_ARGUMENT, message: `not found` });
            }

            console.log(data);
            const movie: Movie = {
                id: data.id,
                title: data.title,
                overview: data.overview,
                releaseDate: data.release_date,
                posterPath: data.poster_path ? `${this.MOVIES_POSTER_PATH}${data.poster_path}` : null,
                backdropPath: data.backdrop_path ? `${this.MOVIES_POSTER_PATH}${data.backdrop_path}` : null,
                popularity: data.popularity
            };

            return { movie: movie };
        } catch (error) {
            throw new RpcException({ code: status.INTERNAL, message: `Error getting mediaId = ${mediaId} :` + error.message });
        }

    }


    async searchMovieByName(request: SearchMovieByNameRequest): Promise<SearchMovieByNameResponse> {

        // Build URL
        const moviesApiURL = `${this.MOVIES_BASE_URL}/search/movie?sort_by=popularity.desc&query=${request.name}&include_adult=true&language=en-US&page=1`;
        console.log(moviesApiURL);
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
            throw (error);
        }
    }
}
