import { Test, TestingModule } from '@nestjs/testing';
import { MovieModule } from './movie.module';

describe('MovieModule', () => {
  let movieModule: MovieModule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MovieModule],
    }).compile();

    movieModule = module.get<MovieModule>(MovieModule);
  });

  it('should be defined', () => {
    expect(movieModule).toBeDefined();
  });
});
