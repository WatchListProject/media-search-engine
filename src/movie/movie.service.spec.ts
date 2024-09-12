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

  it('should return movie details while getting movie by id', async () => {
    // Mocked HTTP Response from the external API
    const mockResponseData = {
      adult: false,
      backdrop_path: "/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg",
      belongs_to_collection: {
        id: 8091,
        name: "Alien Collection",
        poster_path: "/gWFHIY77cRVoBRGERwMHqpD27gc.jpg",
        backdrop_path: "/6X42JnSMdo3dPAswOHUuvebdTq7.jpg"
      },
      budget: 11000000,
      genres: [
        {
          id: 27,
          name: "Horror"
        },
        {
          id: 878,
          name: "Science Fiction"
        }
      ],
      homepage: "https://www.20thcenturystudios.com/movies/alien",
      id: 348,
      imdb_id: "tt0078748",
      origin_country: [
        "US"
      ],
      original_language: "en",
      original_title: "Alien",
      overview: "During its return to the earth, commercial spaceship Nostromo intercepts a distress signal from a distant planet. When a three-member team of the crew discovers a chamber containing thousands of eggs on the planet, a creature inside one of the eggs attacks an explorer. The entire crew is unaware of the impending nightmare set to descend upon them when the alien parasite planted inside its unfortunate host is birthed.",
      popularity: 231.091,
      poster_path: "/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg",
      production_companies: [
        {
          id: 25,
          logo_path: "/qZCc1lty5FzX30aOCVRBLzaVmcp.png",
          name: "20th Century Fox",
          origin_country: "US"
        },
        {
          id: 401,
          logo_path: "/t7mM3DvQ9MwDT3YzMCBrkWpWiiz.png",
          name: "Brandywine Productions",
          origin_country: "US"
        }
      ],
      production_countries: [
        {
          iso_3166_1: "US",
          name: "United States of America"
        }
      ],
      release_date: "1979-05-25",
      revenue: 104931801,
      runtime: 117,
      spoken_languages: [
        {
          english_name: "English",
          iso_639_1: "en",
          name: "English"
        },
        {
          english_name: "Spanish",
          iso_639_1: "es",
          name: "Español"
        }
      ],
      status: "Released",
      tagline: "In space, no one can hear you scream.",
      title: "Alien",
      video: false,
      vote_average: 8.2,
      vote_count: 14476
    };

    // Configure mock to global function fetch
    (global as any).fetch.mockResolvedValue(new MockResponse(mockResponseData));

    // Call service method
    const result = await service.getMovieById("348");

    // Verify call
    expect((global as any).fetch).toHaveBeenCalledWith(
      `${service['MOVIES_BASE_URL']}/movie/348?language=en-US&${service['MOVIES_API_KEY']}`,
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
      movie: {
        id: 348,
        title: "Alien",
        overview: "During its return to the earth, commercial spaceship Nostromo intercepts a distress signal from a distant planet. When a three-member team of the crew discovers a chamber containing thousands of eggs on the planet, a creature inside one of the eggs attacks an explorer. The entire crew is unaware of the impending nightmare set to descend upon them when the alien parasite planted inside its unfortunate host is birthed.",
        releaseDate: "1979-05-25",
        posterPath: `${service['MOVIES_POSTER_PATH']}/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg`,
        backdropPath: `${service['MOVIES_POSTER_PATH']}/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg`,
        popularity: 231.091
      }
    });
  });

  it('should throw an error when no movies are found while getting movie by id', async () => {
    const mockDetailsResponse = {
      success: false,
      status_code: 34,
      status_message: "The resource you requested could not be found."
    };

    (global as any).fetch.mockResolvedValue(new MockResponse(mockDetailsResponse));

    await expect(service.getMovieById('123')).rejects.toThrow('not found');
  });

  it('should return a movie with no poster and no backdrop path while getting movie by id', async () => {
    
    // Mocked HTTP Response from the external API
    const mockResponseData = {
      adult: false,
      belongs_to_collection: {
        id: 8091,
        name: "Alien Collection",
        poster_path: "/gWFHIY77cRVoBRGERwMHqpD27gc.jpg",
        backdrop_path: "/6X42JnSMdo3dPAswOHUuvebdTq7.jpg"
      },
      budget: 11000000,
      genres: [
        {
          id: 27,
          name: "Horror"
        },
        {
          id: 878,
          name: "Science Fiction"
        }
      ],
      homepage: "https://www.20thcenturystudios.com/movies/alien",
      id: 348,
      imdb_id: "tt0078748",
      origin_country: [
        "US"
      ],
      original_language: "en",
      original_title: "Alien",
      overview: "During its return to the earth, commercial spaceship Nostromo intercepts a distress signal from a distant planet. When a three-member team of the crew discovers a chamber containing thousands of eggs on the planet, a creature inside one of the eggs attacks an explorer. The entire crew is unaware of the impending nightmare set to descend upon them when the alien parasite planted inside its unfortunate host is birthed.",
      popularity: 231.091,
      production_companies: [
        {
          id: 25,
          logo_path: "/qZCc1lty5FzX30aOCVRBLzaVmcp.png",
          name: "20th Century Fox",
          origin_country: "US"
        },
        {
          id: 401,
          logo_path: "/t7mM3DvQ9MwDT3YzMCBrkWpWiiz.png",
          name: "Brandywine Productions",
          origin_country: "US"
        }
      ],
      production_countries: [
        {
          iso_3166_1: "US",
          name: "United States of America"
        }
      ],
      release_date: "1979-05-25",
      revenue: 104931801,
      runtime: 117,
      spoken_languages: [
        {
          english_name: "English",
          iso_639_1: "en",
          name: "English"
        },
        {
          english_name: "Spanish",
          iso_639_1: "es",
          name: "Español"
        }
      ],
      status: "Released",
      tagline: "In space, no one can hear you scream.",
      title: "Alien",
      video: false,
      vote_average: 8.2,
      vote_count: 14476
    };

    // Configure mock to global function fetch
    (global as any).fetch.mockResolvedValue(new MockResponse(mockResponseData));

    // Call service method
    const result = await service.getMovieById("348");

    // Verify call
    expect((global as any).fetch).toHaveBeenCalledWith(
      `${service['MOVIES_BASE_URL']}/movie/348?language=en-US&${service['MOVIES_API_KEY']}`,
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
      movie: {
        id: 348,
        title: "Alien",
        overview: "During its return to the earth, commercial spaceship Nostromo intercepts a distress signal from a distant planet. When a three-member team of the crew discovers a chamber containing thousands of eggs on the planet, a creature inside one of the eggs attacks an explorer. The entire crew is unaware of the impending nightmare set to descend upon them when the alien parasite planted inside its unfortunate host is birthed.",
        releaseDate: "1979-05-25",
        posterPath: null,
        backdropPath: null,
        popularity: 231.091
      }
    });
  
  });



  afterEach(() => {
    jest.resetAllMocks();
  });
});

