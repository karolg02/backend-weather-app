import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from '../../src/weather/weather.service';
import { WeatherCalculationService } from '../../src/weather/services/weather-calculation.service';
import { OpenMeteoApiService } from '../../src/weather/services/open-meteo-api.service';

describe('WeatherService', () => {
    let service: WeatherService;
    let calculationService: WeatherCalculationService;
    let apiService: OpenMeteoApiService;

    const mockCalculationService = {
        getEstimateGeneratedEnergy: jest.fn(),
        calculateAverage: jest.fn(),
        getWeatherPrediction: jest.fn()
    };

    const mockApiService = {
        fetchWeatherData: jest.fn(),
        fetchSummaryData: jest.fn()
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WeatherService,
                { provide: WeatherCalculationService, useValue: mockCalculationService },
                { provide: OpenMeteoApiService, useValue: mockApiService }
            ],
        }).compile();

        service = module.get<WeatherService>(WeatherService);
        calculationService = module.get<WeatherCalculationService>(WeatherCalculationService);
        apiService = module.get<OpenMeteoApiService>(OpenMeteoApiService);
    });

    describe('getWeatherInfo', () => {
        it('zwraca dane pogodowe z energią', async () => {
            const mockApiData = {
                daily: {
                    time: ['2024-01-01', '2024-01-02'],
                    weather_code: [0, 1],
                    temperature_2m_min: [5, 7],
                    temperature_2m_max: [15, 18],
                    sunshine_duration: [3600, 7200]
                }
            };

            mockApiService.fetchWeatherData.mockResolvedValue(mockApiData);
            mockCalculationService.getEstimateGeneratedEnergy.mockReturnValue([0.5, 1.0]);

            const result = await service.getWeatherInfo(52.52, 13.41);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                date: '2024-01-01',
                weatherCode: 0,
                minTemperature: 5,
                maxTemperature: 15,
                estimatedEnergy: 0.5
            });
        });

        it('obsługuje ujemne temperatury', async () => {
            const mockApiData = {
                daily: {
                    time: ['2024-01-01'],
                    weather_code: [71],
                    temperature_2m_min: [-10],
                    temperature_2m_max: [-2],
                    sunshine_duration: [1800]
                }
            };

            mockApiService.fetchWeatherData.mockResolvedValue(mockApiData);
            mockCalculationService.getEstimateGeneratedEnergy.mockReturnValue([0.25]);

            const result = await service.getWeatherInfo(60.0, 25.0);

            expect(result[0].minTemperature).toBe(-10);
            expect(result[0].maxTemperature).toBe(-2);
        });

        it('wywołuje prawidłowe serwisy', async () => {
            const mockApiData = {
                daily: {
                    time: ['2024-01-01'],
                    weather_code: [0],
                    temperature_2m_min: [5],
                    temperature_2m_max: [15],
                    sunshine_duration: [3600]
                }
            };

            mockApiService.fetchWeatherData.mockResolvedValue(mockApiData);
            mockCalculationService.getEstimateGeneratedEnergy.mockReturnValue([0.5]);

            await service.getWeatherInfo(52.52, 13.41);

            expect(apiService.fetchWeatherData).toHaveBeenCalledWith(52.52, 13.41);
            expect(calculationService.getEstimateGeneratedEnergy).toHaveBeenCalledWith([3600]);
        });

        it('zaokrągla energię do 2 miejsc po przecinku', async () => {
            const mockApiData = {
                daily: {
                    time: ['2024-01-01'],
                    weather_code: [0],
                    temperature_2m_min: [5],
                    temperature_2m_max: [15],
                    sunshine_duration: [3600]
                }
            };

            mockApiService.fetchWeatherData.mockResolvedValue(mockApiData);
            mockCalculationService.getEstimateGeneratedEnergy.mockReturnValue([0.123456]);

            const result = await service.getWeatherInfo(52.52, 13.41);

            expect(result[0].estimatedEnergy).toBe(0.12);
        });

        it('obsługuje pojedynczy dzień', async () => {
            const mockApiData = {
                daily: {
                    time: ['2024-01-01'],
                    weather_code: [3],
                    temperature_2m_min: [8],
                    temperature_2m_max: [22],
                    sunshine_duration: [5400]
                }
            };

            mockApiService.fetchWeatherData.mockResolvedValue(mockApiData);
            mockCalculationService.getEstimateGeneratedEnergy.mockReturnValue([0.75]);

            const result = await service.getWeatherInfo(40.0, -74.0);

            expect(result).toHaveLength(1);
            expect(result[0].estimatedEnergy).toBe(0.75);
        });

        it('mapuje wszystkie pola z API', async () => {
            const mockApiData = {
                daily: {
                    time: ['2024-01-01'],
                    weather_code: [95],
                    temperature_2m_min: [12],
                    temperature_2m_max: [25],
                    sunshine_duration: [9000]
                }
            };

            mockApiService.fetchWeatherData.mockResolvedValue(mockApiData);
            mockCalculationService.getEstimateGeneratedEnergy.mockReturnValue([1.25]);

            const result = await service.getWeatherInfo(48.0, 2.0);

            expect(result[0]).toEqual({
                date: '2024-01-01',
                weatherCode: 95,
                minTemperature: 12,
                maxTemperature: 25,
                estimatedEnergy: 1.25
            });
        });
    });

    describe('getWeatherSummary', () => {
        it('zwraca podsumowanie pogody', async () => {
            const mockApiData = {
                daily: {
                    temperature_2m_min: [5, 3],
                    temperature_2m_max: [15, 18],
                    sunshine_duration: [3600, 7200],
                    surface_pressure_mean: [1013.25, 1015.8],
                    weather_code: [0, 1]
                }
            };

            mockApiService.fetchSummaryData.mockResolvedValue(mockApiData);
            mockCalculationService.calculateAverage
                .mockReturnValueOnce(1014.5)
                .mockReturnValueOnce(5400);
            mockCalculationService.getWeatherPrediction.mockReturnValue('bez opadów');

            const result = await service.getWeatherSummary(52.52, 13.41);

            expect(result).toEqual({
                averagePressure: 1014.5,
                averageExpositionTime: 1.5,
                minTemperature: 3,
                maxTemperature: 18,
                weatherPrediction: 'bez opadów'
            });
        });

        it('zaokrągla wartości', async () => {
            const mockApiData = {
                daily: {
                    temperature_2m_min: [5.123],
                    temperature_2m_max: [15.789],
                    sunshine_duration: [5555],
                    surface_pressure_mean: [1013.256789],
                    weather_code: [0]
                }
            };

            mockApiService.fetchSummaryData.mockResolvedValue(mockApiData);
            mockCalculationService.calculateAverage
                .mockReturnValueOnce(1013.256789)
                .mockReturnValueOnce(5555);
            mockCalculationService.getWeatherPrediction.mockReturnValue('bez opadów');

            const result = await service.getWeatherSummary(50.0, 20.0);

            expect(result.averagePressure).toBe(1013.26);
            expect(result.averageExpositionTime).toBe(1.54);
        });

        it('wywołuje wszystkie potrzebne serwisy', async () => {
            const mockApiData = {
                daily: {
                    temperature_2m_min: [5],
                    temperature_2m_max: [15],
                    sunshine_duration: [3600],
                    surface_pressure_mean: [1013.25],
                    weather_code: [0]
                }
            };

            mockApiService.fetchSummaryData.mockResolvedValue(mockApiData);
            mockCalculationService.calculateAverage
                .mockReturnValueOnce(1013.25)
                .mockReturnValueOnce(3600);
            mockCalculationService.getWeatherPrediction.mockReturnValue('bez opadów');

            await service.getWeatherSummary(52.52, 13.41);

            expect(apiService.fetchSummaryData).toHaveBeenCalledWith(52.52, 13.41);
            expect(calculationService.calculateAverage).toHaveBeenCalledWith([1013.25]);
            expect(calculationService.calculateAverage).toHaveBeenCalledWith([3600]);
            expect(calculationService.getWeatherPrediction).toHaveBeenCalledWith([0]);
        });

        it('konwertuje sekundy na godziny', async () => {
            const mockApiData = {
                daily: {
                    temperature_2m_min: [5],
                    temperature_2m_max: [15],
                    sunshine_duration: [7200],
                    surface_pressure_mean: [1013.25],
                    weather_code: [0]
                }
            };

            mockApiService.fetchSummaryData.mockResolvedValue(mockApiData);
            mockCalculationService.calculateAverage
                .mockReturnValueOnce(1013.25)
                .mockReturnValueOnce(7200); // 2 godziny
            mockCalculationService.getWeatherPrediction.mockReturnValue('bez opadów');

            const result = await service.getWeatherSummary(50.0, 20.0);

            expect(result.averageExpositionTime).toBe(2.0);
        });

        it('znajduje min i max temperatury', async () => {
            const mockApiData = {
                daily: {
                    temperature_2m_min: [10, -5, 0, 15, -2],
                    temperature_2m_max: [20, 5, 10, 25, 8],
                    sunshine_duration: [3600],
                    surface_pressure_mean: [1013],
                    weather_code: [0]
                }
            };

            mockApiService.fetchSummaryData.mockResolvedValue(mockApiData);
            mockCalculationService.calculateAverage
                .mockReturnValueOnce(1013.0)
                .mockReturnValueOnce(3600);
            mockCalculationService.getWeatherPrediction.mockReturnValue('bez opadów');

            const result = await service.getWeatherSummary(50.0, 20.0);

            expect(result.minTemperature).toBe(-5.0);
            expect(result.maxTemperature).toBe(25.0);
        });

        it('zaokrągla temperatury do 1 miejsca po przecinku', async () => {
            const mockApiData = {
                daily: {
                    temperature_2m_min: [5.567],
                    temperature_2m_max: [15.123],
                    sunshine_duration: [3600],
                    surface_pressure_mean: [1013.25],
                    weather_code: [0]
                }
            };

            mockApiService.fetchSummaryData.mockResolvedValue(mockApiData);
            mockCalculationService.calculateAverage
                .mockReturnValueOnce(1013.25)
                .mockReturnValueOnce(3600);
            mockCalculationService.getWeatherPrediction.mockReturnValue('bez opadów');

            const result = await service.getWeatherSummary(50.0, 20.0);

            expect(result.minTemperature).toBe(5.6);
            expect(result.maxTemperature).toBe(15.1);
        });
    });
});