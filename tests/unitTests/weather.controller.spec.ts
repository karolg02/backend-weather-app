import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from '../../src/weather/weather.controller';
import { WeatherService } from '../../src/weather/weather.service';
import { WeatherQueryDto } from '../../src/weather/dto/weather-query.dto';

describe('WeatherController', () => {
    let controller: WeatherController;
    let weatherService: WeatherService;

    const mockWeatherService = {
        getWeatherInfo: jest.fn(),
        getWeatherSummary: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WeatherController],
            providers: [
                {
                    provide: WeatherService,
                    useValue: mockWeatherService
                }
            ],
        }).compile();

        controller = module.get<WeatherController>(WeatherController);
        weatherService = module.get<WeatherService>(WeatherService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getWeather', () => {
        it('wywołuje weatherService.getWeatherInfo z prawidłowymi parametrami', async () => {
            const mockWeatherData = [
                {
                    date: '2024-01-01',
                    weatherCode: 0,
                    minTemperature: 5,
                    maxTemperature: 15,
                    estimatedEnergy: 2.5
                }
            ];

            const query: WeatherQueryDto = {
                latitude: 52.52,
                longitude: 13.41
            };

            mockWeatherService.getWeatherInfo.mockResolvedValue(mockWeatherData);

            const result = await controller.getWeather(query);

            expect(weatherService.getWeatherInfo).toHaveBeenCalledWith(52.52, 13.41);
            expect(weatherService.getWeatherInfo).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockWeatherData);
        });

        it('przekazuje ujemne współrzędne do serwisu', async () => {
            const query: WeatherQueryDto = {
                latitude: -34.61,
                longitude: -58.38
            };

            mockWeatherService.getWeatherInfo.mockResolvedValue([]);

            await controller.getWeather(query);

            expect(weatherService.getWeatherInfo).toHaveBeenCalledWith(-34.61, -58.38);
        });

        it('zwraca dane bezpośrednio z serwisu', async () => {
            const mockData = [
                { date: '2002-06-14', weatherCode: 1, minTemperature: 0, maxTemperature: 10, estimatedEnergy: 1.0 },
                { date: '2025-06-18', weatherCode: 2, minTemperature: 2, maxTemperature: 12, estimatedEnergy: 1.5 }
            ];

            const query: WeatherQueryDto = {
                latitude: 60.0,
                longitude: 25.0
            };

            mockWeatherService.getWeatherInfo.mockResolvedValue(mockData);

            const result = await controller.getWeather(query);

            expect(result).toBe(mockData);
            expect(result).toHaveLength(2);
        });

        it('propaguje błędy z weatherService', async () => {
            const query: WeatherQueryDto = {
                latitude: 52.52,
                longitude: 13.41
            };

            const error = new Error('Weather API Error');
            mockWeatherService.getWeatherInfo.mockRejectedValue(error);

            await expect(controller.getWeather(query)).rejects.toThrow('Weather API Error');
            expect(weatherService.getWeatherInfo).toHaveBeenCalledWith(52.52, 13.41);
        });
    });

    describe('getSummarize', () => {
        it('weatherService.getWeatherSummary z prawidłowymi parametrami', async () => {
            const mockSummary = {
                averagePressure: 1013.25,
                averageExpositionTime: 6.5,
                minTemperature: -2,
                maxTemperature: 18,
                weatherPrediction: 'bez opadów'
            };

            const query: WeatherQueryDto = {
                latitude: 52.52,
                longitude: 13.41
            };

            mockWeatherService.getWeatherSummary.mockResolvedValue(mockSummary);

            const result = await controller.getSummarize(query);

            expect(weatherService.getWeatherSummary).toHaveBeenCalledWith(52.52, 13.41);
            expect(weatherService.getWeatherSummary).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockSummary);
        });

        it('zwraca podsumowanie bezpośrednio z serwisu', async () => {
            const mockSummary = {
                averagePressure: 1015.8,
                averageExpositionTime: 8.2,
                minTemperature: 5,
                maxTemperature: 25,
                weatherPrediction: 'z opadami'
            };

            const query: WeatherQueryDto = {
                latitude: 40.71,
                longitude: -74.01
            };

            mockWeatherService.getWeatherSummary.mockResolvedValue(mockSummary);

            const result = await controller.getSummarize(query);

            expect(result).toBe(mockSummary);
            expect(result.weatherPrediction).toBe('z opadami');
        });

        it('obsługuje różne lokalizacje geograficzne', async () => {
            const locations = [
                { latitude: 48.85, longitude: 2.35 },
                { latitude: 35.68, longitude: 139.76 },
            ];

            for (const location of locations) {
                const query: WeatherQueryDto = location;

                mockWeatherService.getWeatherSummary.mockResolvedValue({
                    averagePressure: 1013,
                    averageExpositionTime: 6,
                    minTemperature: 10,
                    maxTemperature: 20,
                    weatherPrediction: 'bez opadów'
                });

                await controller.getSummarize(query);

                expect(weatherService.getWeatherSummary).toHaveBeenCalledWith(
                    location.latitude,
                    location.longitude
                );
            }
        });

        it('znajduje błędy z weatherService', async () => {
            const query: WeatherQueryDto = {
                latitude: 52.52,
                longitude: 13.41
            };

            const error = new Error('Summary API Error');
            mockWeatherService.getWeatherSummary.mockRejectedValue(error);

            await expect(controller.getSummarize(query)).rejects.toThrow('Summary API Error');
            expect(weatherService.getWeatherSummary).toHaveBeenCalledWith(52.52, 13.41);
        });
    });

    describe('Method signatures', () => {
        it('getWeather przyjmuje WeatherQueryDto', async () => {
            const query: WeatherQueryDto = {
                latitude: 52.52,
                longitude: 13.41
            };

            mockWeatherService.getWeatherInfo.mockResolvedValue([]);

            const result = await controller.getWeather(query);

            expect(typeof result).toBe('object');
            expect(Array.isArray(result)).toBe(true);
        });

        it('getSummarize przyjmuje WeatherQueryDto', async () => {
            const query: WeatherQueryDto = {
                latitude: 52.52,
                longitude: 13.41
            };

            mockWeatherService.getWeatherSummary.mockResolvedValue({
                averagePressure: 1013,
                averageExpositionTime: 6,
                minTemperature: 10,
                maxTemperature: 20,
                weatherPrediction: 'bez opadów'
            });

            const result = await controller.getSummarize(query);

            expect(typeof result).toBe('object');
            expect(result).toHaveProperty('averagePressure');
            expect(result).toHaveProperty('weatherPrediction');
        });
    });
});