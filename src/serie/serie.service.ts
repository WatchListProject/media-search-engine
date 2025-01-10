import { status } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Serie, SearchSerieByNameRequest, SearchSerieByNameResponse, GetMediaByIdResponse } from 'src/media_search_engine.pb';
import { format } from 'date-fns';  

@Injectable()
export class SerieService {

    private readonly SERIES_BASE_URL = process.env.SERIES_BASE_URL;

    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        return format(date, 'dd/MM/yyyy HH:mm');
    }

    async getSerieById(mediaId: string): Promise<GetMediaByIdResponse> {
        try {
            const seriesDetailsApiURL = `${this.SERIES_BASE_URL}/show-details?q=${mediaId}`;
            const detailsResponse = await fetch(seriesDetailsApiURL);
            
            if (!detailsResponse.ok) {
                throw new RpcException({ code: status.INVALID_ARGUMENT, message: "Details response API Failed" });
            }

            const detailsData = await detailsResponse.json();
            if (detailsData.tvShow.length === 0) {
                throw new RpcException({ code: status.INVALID_ARGUMENT, message: `not found` });
            }

            const serie: Serie = {
                id: detailsData.tvShow.id.toString(),
                title: detailsData.tvShow.name,
                overview: detailsData.tvShow.description,
                startDate: this.formatDate(detailsData.tvShow.start_date), 
                endDate: detailsData.tvShow.end_date ? this.formatDate(detailsData.tvShow.end_date) : null, 
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
            throw new RpcException({ code: status.INTERNAL, message:  error.message });
        }
    }

    async searchSerieByName(request: SearchSerieByNameRequest): Promise<SearchSerieByNameResponse> {
        try {
            const seriesSearchApiURL = `${this.SERIES_BASE_URL}/search?q=${request.name}&page=1`;

            const searchResponse = await fetch(seriesSearchApiURL);
            if (!searchResponse.ok) {
                throw new Error(`Error fetching search results: ${searchResponse.statusText}`);
            }

            const searchData = await searchResponse.json();
            const seriesIdList: number[] = searchData.tv_shows.map(serie => serie.id);

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
                    startDate: this.formatDate(detailsData.tvShow.start_date),  
                    endDate: detailsData.tvShow.end_date ? this.formatDate(detailsData.tvShow.end_date) : null,  
                    runTime: detailsData.tvShow.runtime,
                    numberOfEpisodes: detailsData.tvShow.episodes.length,
                    posterPath: detailsData.tvShow.image_path || null,
                    backdropPath: detailsData.tvShow.pictures[0] || null,
                    popularity: detailsData.tvShow.rating * detailsData.tvShow.rating_count
                } as Serie;
            });

            const seriesList = await Promise.all(seriesDetailsPromises);

            seriesList.sort((a, b) => b.popularity - a.popularity);

            return { seriesList };
        } catch (error) {
            throw new RpcException({ code: status.INTERNAL, message: error.message });
        }
    }
}
