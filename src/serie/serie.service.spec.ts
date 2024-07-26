import { Test, TestingModule } from '@nestjs/testing';
import { SerieService } from './serie.service';

// Mock HTTP Response
class MockResponse {
  private data: any;
  public ok: boolean;
  public statusText: string;

  constructor(data: any, ok: boolean, statusText: string) {
    this.data = data;
    this.ok = ok;
    this.statusText = statusText;
  }

  async json() {
    return this.data;
  }
}

describe('SerieService', () => {
  let service: SerieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SerieService],
    }).compile();

    service = module.get<SerieService>(SerieService);

    (global as any).fetch = jest.fn();
  });

  it('should return a list of series on a successful search ordered by popularity', async () => {
    // Mocked HTTP Response from the external API
    const mockSearchResponse = {
      tv_shows: [
        { id: 333 },
        { id: 212 },
        { id: 111 }
      ]
    };

    const mockDetailsResponses = {
      333: {
        tvShow: {
          id: 333,
          name: "Serie Covenant",
          description: "Serie Covenant description.",
          start_date: "2017-05-11",
          end_date: null,
          runtime: 50,
          episodes: [1, 2, 3],
          image_path: "/poster.jpg",
          pictures: ["/backdrop.jpg"],
          rating: 6.5,
          rating_count: 2000
        }
      },
      212: {
        tvShow: {
          id: 212,
          name: "Serie 2",
          description: "Serie 2 description.",
          start_date: "1986-12-25",
          end_date: null,
          runtime: 50,
          episodes: [1, 2, 3],
          image_path: "/poster.jpg",
          pictures: ["/backdrop.jpg"],
          rating: 7,
          rating_count: 3000
        }
      },
      111: {
        tvShow: {
          id: 111,
          name: "Serie 1",
          description: "Serie 1 description.",
          start_date: "1979-05-20",
          end_date: null,
          runtime: 50,
          episodes: [1, 2, 3],
          image_path: "/poster.jpg",
          pictures: ["/backdrop.jpg"],
          rating: 8,
          rating_count: 4000
        }
      }
    };

    // Configure mock fetch to handle the search and details requests
    (global as any).fetch.mockImplementation((url: string) => {
      if (url.includes('/search')) {
        return Promise.resolve(new MockResponse(mockSearchResponse, true, "Status OK"));
      } else if (url.includes('/show-details')) {
        const id = url.split('=')[1];
        return Promise.resolve(new MockResponse(mockDetailsResponses[id], true, "Status OK"));
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Call service method
    const result = await service.searchSerieByName({ name: 'Alien' });

    // Verify call
    expect((global as any).fetch).toHaveBeenCalledWith(
      `${service['SERIES_BASE_URL']}/search?q=Alien&page=1`,
    );

    // Verify result
    expect(result).toEqual({
      seriesList: [
        {
          id: "111",
          title: "Serie 1",
          overview: "Serie 1 description.",
          startDate: "1979-05-20",
          endDate: null,
          runTime: 50,
          numberOfEpisodes: 3,
          posterPath: "/poster.jpg",
          backdropPath: "/backdrop.jpg",
          popularity: 32000
        },
        {
          id: "212",
          title: "Serie 2",
          overview: "Serie 2 description.",
          startDate: "1986-12-25",
          endDate: null,
          runTime: 50,
          numberOfEpisodes: 3,
          posterPath: "/poster.jpg",
          backdropPath: "/backdrop.jpg",
          popularity: 21000
        },
        {
          id: "333",
          title: "Serie Covenant",
          overview: "Serie Covenant description.",
          startDate: "2017-05-11",
          endDate: null,
          runTime: 50,
          numberOfEpisodes: 3,
          posterPath: "/poster.jpg",
          backdropPath: "/backdrop.jpg",
          popularity: 13000
        }
      ],
    });
  });

  it('should throw an error when the external API fails', async () => {
    // Mock fetch to simulate an error
    (global as any).fetch.mockRejectedValue(new Error('Some error'));

    // Expect service to throw an error
    await expect(service.searchSerieByName({ name: 'Alien' })).rejects.toThrow('Some error');
  });

  it('should throw an error when the external search API response status is not OK', async () => {


    // Configure mock fetch to handle the search and details requests
    (global as any).fetch.mockImplementation((url: string) => {
      if (url.includes('/search')) {
        return Promise.resolve(new MockResponse({}, false, "Search API Error"));
      } else if (url.includes('/show-details')) {
        return Promise.resolve(new MockResponse({}, false, "Details API Error"));
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Expect service to throw an error
    await expect(service.searchSerieByName({ name: 'Alien' })).rejects.toThrow(`Error fetching search results: Search API Error`);

  });

  it('should throw an error when the external details API response status is not OK', async () => {
    // mock the external search API response
    const mockSearchResponse = {
      tv_shows: [
        { id: 333 },
        { id: 212 },
        { id: 111 }
      ]
    };

    // Configure mock fetch to handle the search and details requests
    (global as any).fetch.mockImplementation((url: string) => {
      if (url.includes('/search')) {
        return Promise.resolve(new MockResponse(mockSearchResponse, true, "Status OK"));
      } else if (url.includes('/show-details')) {
        return Promise.resolve(new MockResponse({}, false, "Details API Error"));
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Expect service to throw an error
    await expect(service.searchSerieByName({ name: 'Alien' })).rejects.toThrow(`Error fetching details for series ID ${mockSearchResponse.tv_shows[0].id}: Details API Error`);

  });

  it('should return a series with no poster and no backdrop path', async () => {
    // Mocked HTTP Response from the external API
    const mockSearchResponse = {
      tv_shows: [
        { id: 111 }
      ]
    };

    const mockDetailsResponse = {
      tvShow: {
        id: 111,
        name: "Serie 1",
        description: "Serie 1 description.",
        start_date: "1979-05-20",
        end_date: null,
        runtime: 50,
        episodes: [1, 2, 3],
        image_path: null,
        pictures: [],
        rating: 8,
        rating_count: 4000
      }
    };

    // Configure mock fetch to handle the search and details requests
    (global as any).fetch.mockImplementation((url: string) => {
      if (url.includes('/search')) {
        return Promise.resolve(new MockResponse(mockSearchResponse, true, "Status OK"));
      } else if (url.includes('/show-details')) {
        return Promise.resolve(new MockResponse(mockDetailsResponse, true, "Status OK"));
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Call service method
    const result = await service.searchSerieByName({ name: 'Alien' });

    // Verify result
    expect(result).toEqual({
      seriesList: [
        {
          id: "111",
          title: "Serie 1",
          overview: "Serie 1 description.",
          startDate: "1979-05-20",
          endDate: null,
          runTime: 50,
          numberOfEpisodes: 3,
          posterPath: null,
          backdropPath: null,
          popularity: 32000
        },
      ],
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
