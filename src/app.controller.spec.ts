import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { MovieService } from './movie/movie.service';
import { SerieService } from './serie/serie.service';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { of } from 'rxjs';
import { GetMediaByIdResponse, SearchMovieByNameResponse, SearchSerieByNameResponse } from './media_search_engine.pb';

describe('AppController', () => {
    let appController: AppController;
    let movieService: MovieService;
    let serieService: SerieService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                {
                    provide: MovieService,
                    useValue: {
                        getMovieById: jest.fn(),
                        searchMovieByName: jest.fn(),
                    },
                },
                {
                    provide: SerieService,
                    useValue: {
                        getSerieById: jest.fn(),
                        searchSerieByName: jest.fn(),
                    },
                },
            ],
        }).compile();

        appController = module.get<AppController>(AppController);
        movieService = module.get<MovieService>(MovieService);
        serieService = module.get<SerieService>(SerieService);
    });

    describe('getMediaById', () => {
        it('should return a serie if mediaType is SERIE', async () => {
            const request = { mediaType: 'SERIE', mediaId: '123' };
            const expectedResponse: GetMediaByIdResponse = {
                serie: {
                  id: "123",
                  title: "Sit Down, Shut Up (AU)",
                  overview: "<br>",
                  startDate: "Feb/16/2001",
                  endDate: "Jun/28/2001",
                  runTime: 30,
                  numberOfEpisodes: 13,
                  posterPath: "https://static.episodate.com",
                  backdropPath: "",
                  popularity: 0
                }
              };

            jest.spyOn(serieService, 'getSerieById').mockResolvedValue(expectedResponse);

            const result = await appController.getMediaById(request);
            expect(result).toEqual(expectedResponse);
            expect(serieService.getSerieById).toHaveBeenCalledWith('123');
        });

        it('should return a movie if mediaType is MOVIE', async () => {
            const request = { mediaType: 'MOVIE', mediaId: '123' };
            const expectedResponse = {
                movie: {
                  id: "123",
                  title: "The Lord of the Rings",
                  overview: "The Fellowship of the Ring embark on a journey to destroy the One Ring and end Sauron's reign over Middle-earth.",
                  releaseDate: "1978-11-15",
                  posterPath: "https://image.tmdb.org/t/p/w500/liW0mjvTyLs7UCumaHhx3PpU4VT.jpg",
                  backdropPath: "https://image.tmdb.org/t/p/w500/jOuCWdh0BE6XPu2Vpjl08wDAeFz.jpg",
                  popularity: 32
                },
                media: "movie"
              };

            jest.spyOn(movieService, 'getMovieById').mockResolvedValue(expectedResponse);

            const result = await appController.getMediaById(request);
            expect(result).toEqual(expectedResponse);
            expect(movieService.getMovieById).toHaveBeenCalledWith('123');
        });

        it('should throw an RpcException if mediaType is invalid', async () => {
            const request = { mediaType: 'INVALID_TYPE', mediaId: '123' };

            try {
                await appController.getMediaById(request);
            } catch (error) {
                expect(error).toBeInstanceOf(RpcException);
                expect(error.getError().code).toBe(status.INTERNAL);
                expect(error.getError().message).toBe("MediaType 'INVALID_TYPE' doesnt exist");
            }
        });
    });

    describe('searchMovieByName', () => {
        it('should return search results for a movie', async () => {
            const request = { name: 'Alien' };
            const expectedResponse: SearchMovieByNameResponse = {
                moviesList: [
                    {
                        id: "945961",
                        title: "Alien: Romulus",
                        overview: "While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.",
                        releaseDate: "2024-08-13",
                        posterPath: "https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg",
                        popularity: 692
                    },
                    {
                        id: "348",
                        title: "Alien",
                        overview: "During its return to the earth, commercial spaceship Nostromo intercepts a distress signal from a distant planet. When a three-member team of the crew discovers a chamber containing thousands of eggs on the planet, a creature inside one of the eggs attacks an explorer. The entire crew is unaware of the impending nightmare set to descend upon them when the alien parasite planted inside its unfortunate host is birthed.",
                        releaseDate: "1979-05-25",
                        posterPath: "https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg",
                        popularity: 231
                    },
                    {
                        id: "126889",
                        title: "Alien: Covenant",
                        overview: "The crew of the colony ship Covenant, bound for a remote planet on the far side of the galaxy, discovers what they think is an uncharted paradise but is actually a dark, dangerous world.",
                        releaseDate: "2017-05-09",
                        posterPath: "https://image.tmdb.org/t/p/w500/zecMELPbU5YMQpC81Z8ImaaXuf9.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/2qluV8y79LnBBHaMpwewCjQ1Htk.jpg",
                        popularity: 192
                    },
                    {
                        id: "601796",
                        title: "Alienoid",
                        overview: "Gurus in the late Goryeo dynasty try to obtain a fabled, holy sword, and humans in 2022 hunt down an alien prisoner that is locked in a human's body. The two parties cross paths when a time-traveling portal opens up.",
                        releaseDate: "2022-07-20",
                        posterPath: "https://image.tmdb.org/t/p/w500/8QVDXDiOGHRcAD4oM6MXjE0osSj.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/7ZP8HtgOIDaBs12krXgUIygqEsy.jpg",
                        popularity: 167
                    },
                    {
                        id: "679",
                        title: "Aliens",
                        overview: "Ripley, the sole survivor of the Nostromo's deadly encounter with the monstrous Alien, returns to Earth after drifting through space in hypersleep for 57 years. Although her story is initially met with skepticism, she agrees to accompany a team of Colonial Marines back to LV-426.",
                        releaseDate: "1986-07-18",
                        posterPath: "https://image.tmdb.org/t/p/w500/r1x5JGpyqZU8PYhbs4UcrO1Xb6x.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/jMBpJFRtrtIXymer93XLavPwI3P.jpg",
                        popularity: 143
                    },
                    {
                        id: "626412",
                        title: "Alienoid: The Return to the Future",
                        overview: "Ean has a critical mission to return to the future to save everyone. However, she becomes trapped in the distant past while trying to prevent the escape of alien prisoners who are locked up in the bodies of humans. Meanwhile, Muruk, who helps Ean escape various predicaments, is unnerved when he begins sensing the presence of a strange being in his body. Traveling through the centuries, they are trying to prevent the explosion of the haava.",
                        releaseDate: "2024-01-10",
                        posterPath: "https://image.tmdb.org/t/p/w500/4RClncz0GTKPZzSAcAalHCw0h3g.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/kZbTOcTrEGyroQMWQSGIRlNSkwP.jpg",
                        popularity: 99
                    },
                    {
                        id: "8077",
                        title: "Alien³",
                        overview: "After escaping with Newt and Hicks from the alien planet, Ripley crash lands on Fiorina 161, a prison planet and host to a correctional facility. Unfortunately, although Newt and Hicks do not survive the crash, a more unwelcome visitor does. The prison does not allow weapons of any kind, and with aid being a long time away, the prisoners must simply survive in any way they can.",
                        releaseDate: "1992-05-22",
                        posterPath: "https://image.tmdb.org/t/p/w500/xh5wI0UoW7DfS1IyLy3d2CgrCEP.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/nEmOmbCWBXS3tHU2N49z693KDK.jpg",
                        popularity: 93
                    },
                    {
                        id: "440",
                        title: "Aliens vs Predator: Requiem",
                        overview: "After a horrifying PredAlien crash-lands near a small Colorado town, killing everyone it encounters and producing countless Alien offspring, a lone Predator arrives to \"clean up\" the infestation.",
                    releaseDate: "2007-12-25",
                        posterPath: "https://image.tmdb.org/t/p/w500/jCyJN1vj8jqJJ0vNw4hDH2KlySO.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/y8yvIrmoM2PLuJcSto7OmOfsXQj.jpg",
                        popularity: 87
                    },
                    {
                        id: "8078",
                        title: "Alien Resurrection",
                        overview: "Two hundred years after Lt. Ripley died, a group of scientists clone her, hoping to breed the ultimate weapon. But the new Ripley is full of surprises … as are the new aliens. Ripley must team with a band of smugglers to keep the creatures from reaching Earth.",
                        releaseDate: "1997-11-12",
                        posterPath: "https://image.tmdb.org/t/p/w500/9aRDMlU5Zwpysilm0WCWzU2PCFv.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/f0dFcDXdF6CGz1P1rDzOhwD9hs8.jpg",
                        popularity: 83
                    },
                    {
                        id: "49849",
                        title: "Cowboys & Aliens",
                        overview: "A stranger stumbles into the desert town of Absolution with no memory of his past and a futuristic shackle around his wrist. With the help of mysterious beauty Ella and the iron-fisted Colonel Dolarhyde, he finds himself leading an unlikely posse of cowboys, outlaws, and Apache warriors against a common enemy from beyond this world in an epic showdown for survival.",
                        releaseDate: "2011-07-29",
                        posterPath: "https://image.tmdb.org/t/p/w500/9uZsGCP4rvOHVGCpMpYq5gNCuNI.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/sGXCYMzr1sCnGNVuRpB2TOWPWDA.jpg",
                        popularity: 48
                    },
                    {
                        id: "506517",
                        title: "My Grandpa is an Alien",
                        overview: "Una and an alien robot have 24 hours to find her Grandpa who was kidnapped by aliens. The extraordinary adventure leads to friendship, the rational robotic logic is replaced by emotions and Una's selfless love saves her partly alien family.",
                        releaseDate: "2019-03-21",
                        posterPath: "https://image.tmdb.org/t/p/w500/bWXH1kEDlLkHmn2R0udaspgVQSJ.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/lnW8H1fNtzzI8OOrjZmXzMn5A0j.jpg",
                        popularity: 26
                    },
                    {
                        id: "453575",
                        title: "Crayon Shin-chan: Invasion!! Alien Shiriri",
                        overview: "When the mysterious Shiriri turns his parents into children, Shin-chan must trek across Japan to help return them to adult form.",
                        releaseDate: "2017-04-15",
                        posterPath: "https://image.tmdb.org/t/p/w500/aa7X8NXBoeQfhqzJ079SN8WAJMm.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/rPfjyws2DDm5lPPj5OQ5HjPDC8Q.jpg",
                        popularity: 22
                    },
                    {
                        id: "817189",
                        title: "Alien",
                        overview: "",
                        releaseDate: "2017-05-16",
                        posterPath: "https://image.tmdb.org/t/p/w500/sI5eeqdoiZ62zv11WSMEev6Ynim.jpg",
                        backdropPath: "",
                        popularity: 15
                    },
                    {
                        id: "432383",
                        title: "Luis and the Aliens",
                        overview: "The story 11-year-old Luis who makes friends with three loveable little aliens, who crash their UFO into his house. In return for Luis' help in finding the home-shopping channel stuff they came for, they save Luis from boarding school - and an exciting adventure follows.",
                        releaseDate: "2018-05-09",
                        posterPath: "https://image.tmdb.org/t/p/w500/5oq7s5ru4hjp83mi4fWSJ0L7yUA.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/p3ZII4uLzv2y2FV4XUqBYNfmLN6.jpg",
                        popularity: 13
                    },
                    {
                        id: "593035",
                        title: "Alien Warfare",
                        overview: "A team of Navy Seals investigates a mysterious science outpost only to have to combat a squad of powerful alien soldiers.",
                        releaseDate: "2019-04-05",
                        posterPath: "https://image.tmdb.org/t/p/w500/rJOj0T5DyChfECevDg0xpEGznsl.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/sumajFyOoIKubI15POZ0p8Ekpzu.jpg",
                        popularity: 10
                    },
                    {
                        id: "42872",
                        title: "Alien 2: On Earth",
                        overview: "A group of cave explorers are confronted in an underground cavern by a mysterious living rock. Little do they know that it bears home to deadly, flesh-eating creatures, intent on wiping out the entire human population. An ultra low-budget, unofficial and unauthorized sequel to the 1979 film Alien, although the plot has little connection to the original film.",
                        releaseDate: "1980-04-11",
                        posterPath: "https://image.tmdb.org/t/p/w500/3LLfieDmGmfQ0PTJfNIaLR2y69C.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/qB9ByLtpl0soAgntH9sIOUxReVx.jpg",
                        popularity: 5
                    },
                    {
                        id: "538467",
                        title: "Alien",
                        overview: "",
                        releaseDate: "2018-01-01",
                        posterPath: "https://image.tmdb.org/t/p/w500/kCnz4ZS2OHJ36908E3H8BqgQCzI.jpg",
                        backdropPath: "",
                        popularity: 5
                    },
                    {
                        id: "1181709",
                        title: "Alien Apocalypse",
                        overview: "An unmanned spaceship returns to Earth carrying samples from Proxima B in the Alpha Centauri system. As scientists study the specimens they discover the alien elements are alive! Soon, the scientists must fight back as the small creatures replicate at an exponential rate, increase in size, turn violent and attempt to take over Earth.",
                        releaseDate: "2023-11-03",
                        posterPath: "https://image.tmdb.org/t/p/w500/1lkTMi48Fx42mc6zN1Uca32253I.jpg",
                        backdropPath: "https://image.tmdb.org/t/p/w500/1uw1jOIz3VxUT7QyKDqpZbLKlyh.jpg",
                        popularity: 5
                    },
                    {
                        id: "1187412",
                        title: "Alien",
                        overview: "how aliens might be in a country like India",
                        releaseDate: "",
                        posterPath: "",
                        backdropPath: "",
                        popularity: 4
                    },
                    {
                        id: "881423",
                        title: "Alien",
                        overview: "And from silence and darkness awakes - an all-moving, all-turning being. White, yellow and golden spindles in vigorous synchronised rotation. Twirling in shiny pirouettes in an old workshop full of nooks and crannies, they spin the big thread, sacrificing themselves. In the midst of the heat and noise of the historic machine souls a hunched old man is working, sometimes a cog, sometimes the conductor.",
                        releaseDate: "2017-10-06",
                        posterPath: "",
                        backdropPath: "",
                        popularity: 3
                    }
                ]
            };

            jest.spyOn(movieService, 'searchMovieByName').mockResolvedValue(expectedResponse);

            const result = await appController.searchMovieByName(request);
            expect(result).toEqual(expectedResponse);
            expect(movieService.searchMovieByName).toHaveBeenCalledWith(request);
        });
    });

    describe('searchSerieByName', () => {
        it('should return search results for a serie', async () => {
            const request = { name: 'Breaking Bad' };

            const expectedResponse: SearchSerieByNameResponse = {
                seriesList: [
                    {
                        id: "17658",
                        title: "Breaking Bad",
                        overview: "<b>Breaking Bad</b> follows protagonist Walter White, a chemistry teacher who lives in New Mexico with his wife and teenage son who has cerebral palsy. White is diagnosed with Stage III cancer and given a prognosis of two years left to live. With a new sense of fearlessness based on his medical prognosis, and a desire to secure his family's financial security, White chooses to enter a dangerous world of drugs and crime and ascends to power in this world. The series explores how a fatal diagnosis such as White's releases a typical man from the daily concerns and constraints of normal society and follows his transformation from mild family man to a kingpin of the drug trade.",
                        startDate: "2008-01-20",
                        endDate: "",
                        runTime: 60,
                        numberOfEpisodes: 70,
                        posterPath: "https://static.episodate.com/images/tv-show/full/17658.jpg",
                        backdropPath: "https://static.episodate.com/images/episode/17658-294.jpg",
                        popularity: 1110
                    }
                ]
            };

            jest.spyOn(serieService, 'searchSerieByName').mockResolvedValue(expectedResponse);

            const result = await appController.searchSerieByName(request);
            expect(result).toEqual(expectedResponse);
            expect(serieService.searchSerieByName).toHaveBeenCalledWith(request);
        });
    });
});
