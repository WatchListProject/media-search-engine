import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';

// Mock HTTP Response
class MockResponse {
  private data: any;

  constructor(data: any) {
    this.data = data;
  }

  async json() {
    return this.data;
  }
}

describe('MovieService', () => {
  let service: MovieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovieService],
    }).compile();

    service = module.get<MovieService>(MovieService);

    (global as any).fetch = jest.fn();
  });

  it('should return a list of movies on a successful search ordered by popularity', async () => {
    // Mocked HTTP Response from the external API
    const mockResponseData = {
      page: 1,
      results: [
        {
          adult: false,
          backdrop_path: "/backdrop.jpg",
          genre_ids: [
            27,
            878
          ],
          id: 333,
          original_language: "en",
          original_title: "Alien Covenant",
          overview: "Alien Covenant description.",
          popularity: 130,
          poster_path: "/poster.jpg",
          release_date: "2017-05-11",
          title: "Alien Covenant",
          video: false,
          vote_average: 6,
          vote_count: 8000
        },
        {
          adult: false,
          backdrop_path: "/backdrop.jpg",
          genre_ids: [
            27,
            878
          ],
          id: 212,
          original_language: "en",
          original_title: "Alien 2",
          overview: "Alien James Cameron description.",
          popularity: 140,
          poster_path: "/poster.jpg",
          release_date: "1986-12-25",
          title: "Alien 2",
          video: false,
          vote_average: 8,
          vote_count: 9000
        },
        {
          adult: false,
          backdrop_path: "/backdrop.jpg",
          genre_ids: [
            27,
            878
          ],
          id: 111,
          original_language: "en",
          original_title: "Alien",
          overview: "Alien 1979 description.",
          popularity: 150,
          poster_path: "/poster.jpg",
          release_date: "1979-05-20",
          title: "Alien",
          video: false,
          vote_average: 9,
          vote_count: 10000
        }

      ],
      total_pages: 1,
      total_results: 3

    };

    // Configure mock to global function fetch
    (global as any).fetch.mockResolvedValue(new MockResponse(mockResponseData));

    // Call service method
    const result = await service.searchMovieByName({ name: 'Alien' });

    // Verify call
    expect((global as any).fetch).toHaveBeenCalledWith(
      `${service['MOVIES_BASE_URL']}/search/movie?sort_by=popularity.desc&query=Alien&include_adult=true&language=en-US&page=1`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + service['MOVIES_TOKEN'],
        },
      },
    );
    

    // Verify result
    expect(result).toEqual({
      moviesList: [

        {
          id: "111",
          title: "Alien",
          overview: "Alien 1979 description.",
          releaseDate: "1979-05-20",
          posterPath: `${service['MOVIES_POSTER_PATH']}/poster.jpg`,
          backdropPath: `${service['MOVIES_POSTER_PATH']}/backdrop.jpg`,
          popularity: 150
        },
        {
          id: "212",
          title: "Alien 2",
          overview: "Alien James Cameron description.",
          releaseDate: "1986-12-25",
          posterPath: `${service['MOVIES_POSTER_PATH']}/poster.jpg`,
          backdropPath: `${service['MOVIES_POSTER_PATH']}/backdrop.jpg`,
          popularity: 140
        },
        {
          id: "333",
          title: "Alien Covenant",
          overview: "Alien Covenant description.",
          releaseDate: "2017-05-11",
          posterPath: `${service['MOVIES_POSTER_PATH']}/poster.jpg`,
          backdropPath: `${service['MOVIES_POSTER_PATH']}/backdrop.jpg`,
          popularity: 130
        },

      ],
    });
  });

  it('should throw an error when the external API fails', async () => {
    // Mock fetch to simulate an error
    (global as any).fetch.mockRejectedValue(new Error('Some error'));

    // Expect service to throw an error
    await expect(service.searchMovieByName({ name: 'Alien' })).rejects.toThrow('Some error');
  });


  it('should return a movie with no poster and no backdrop path', async () => {
    // Mocked HTTP Response from the external API
    const mockResponseData = {
      page: 1,
      results: [
        {
          adult: false,
          genre_ids: [
            27,
            878
          ],
          id: 111,
          original_language: "en",
          original_title: "Alien",
          overview: "Alien 1979 description.",
          popularity: 150,
          release_date: "1979-05-20",
          title: "Alien",
          video: false,
          vote_average: 9,
          vote_count: 10000
        }

      ],
      total_pages: 1,
      total_results: 3

    };

    // Configure mock to global function fetch
    (global as any).fetch.mockResolvedValue(new MockResponse(mockResponseData));

    // Call service method
    const result = await service.searchMovieByName({ name: 'Alien' });
    
    // Verify result
    expect(result).toEqual({
      moviesList: [

        {
          id: "111",
          title: "Alien",
          overview: "Alien 1979 description.",
          releaseDate: "1979-05-20",
          posterPath: null,
          backdropPath: null,
          popularity: 150
        },

      ],
    });
  });


  afterEach(() => {
    jest.resetAllMocks();
  });
});

