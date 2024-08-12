import { status } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { request } from 'http';
import { Serie, SearchSerieByNameRequest, SearchSerieByNameResponse, GetMediaByIdResponse } from 'src/media_search_engine.pb';

@Injectable()
export class SerieService {

    private readonly SERIES_BASE_URL = process.env.SERIES_BASE_URL;

    async getSerieById(mediaId: string): Promise<GetMediaByIdResponse> {
        try {
            const seriesDetailsApiURL = `${this.SERIES_BASE_URL}/show-details?q=${mediaId}`;
            const detailsResponse = await fetch(seriesDetailsApiURL);
            
            
            if (!detailsResponse.ok) {
                throw new RpcException({ code: status.INVALID_ARGUMENT, message: detailsResponse });
            }

            const detailsData = await detailsResponse.json();
            if (detailsData.tvShow.length == 0) {
                throw new RpcException({ code: status.INVALID_ARGUMENT, message: `not found` });
            }

            const serie: Serie = {
                id: detailsData.tvShow.id.toString(),
                title: detailsData.tvShow.name,
                overview: detailsData.tvShow.description,
                startDate: detailsData.tvShow.start_date,
                endDate: detailsData.tvShow.end_date,
                runTime: detailsData.tvShow.runtime,
                numberOfEpisodes: detailsData.tvShow.episodes.length,
                posterPath: detailsData.tvShow.image_path || null,
                backdropPath: detailsData.tvShow.pictures[0] || null,
                popularity: detailsData.tvShow.rating * detailsData.tvShow.rating_count
            }
            
            return {
                serie: serie
            }
        } 
        catch (error) {
            throw new RpcException({ code: status.INTERNAL, message: `Error getting mediaId = ${mediaId} :`+ error.message });
        }


    }

    async searchSerieByName(request: SearchSerieByNameRequest): Promise<SearchSerieByNameResponse> {
        try {
            // build search URL
            const seriesSearchApiURL = `${this.SERIES_BASE_URL}/search?q=${request.name}&page=1`;

            const searchResponse = await fetch(seriesSearchApiURL);
            if (!searchResponse.ok) {
                throw new Error(`Error fetching search results: ${searchResponse.statusText}`);
            }

            const searchData = await searchResponse.json();
            const seriesIdList: number[] = searchData.tv_shows.map(serie => serie.id);

            // fetch series in paralel
            const seriesDetailsPromises = seriesIdList.map(async (id) => {
                const seriesDetailsApiURL = `${this.SERIES_BASE_URL}/show-details?q=${id}`;
                const detailsResponse = await fetch(seriesDetailsApiURL);
                if (!detailsResponse.ok) {
                    throw new Error(`Error fetching details for series ID ${id}: ${detailsResponse.statusText}`);
                }
                const detailsData = await detailsResponse.json();
                return {
                    id: detailsData.tvShow.id.toString(),
                    title: detailsData.tvShow.name,
                    overview: detailsData.tvShow.description,
                    startDate: detailsData.tvShow.start_date,
                    endDate: detailsData.tvShow.end_date,
                    runTime: detailsData.tvShow.runtime,
                    numberOfEpisodes: detailsData.tvShow.episodes.length,
                    posterPath: detailsData.tvShow.image_path || null,
                    backdropPath: detailsData.tvShow.pictures[0] || null,
                    popularity: detailsData.tvShow.rating * detailsData.tvShow.rating_count
                } as Serie;
            });

            // wait for every promise
            const seriesList = await Promise.all(seriesDetailsPromises);

            // order by popularity
            seriesList.sort((a, b) => b.popularity - a.popularity);

            return { seriesList };
        } catch (error) {
            throw error;
        }
    }


}
