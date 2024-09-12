import { Test, TestingModule } from '@nestjs/testing';
import { SerieModule } from './serie.module';

describe('SerieModule', () => {
  let serieModule: SerieModule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SerieModule],
    }).compile();

    serieModule = module.get<SerieModule>(SerieModule);
  });

  it('should be defined', () => {
    expect(serieModule).toBeDefined();
  });

});
