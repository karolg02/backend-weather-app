import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { OpenMeteoApiService } from '../../src/weather/services/openMeteoAPI.service';
import { ValidationService } from '../../src/common/services/validation.service';
import {
    WeatherApiException,
    WeatherApiTimeoutException,
    WeatherApiNotFoundException,
    WeatherApiGatewayException
} from '../../src/common/exceptions/exceptions';

describe('OpenMeteoApiService', () => {
    let service: OpenMeteoApiService;
    let httpService: HttpService;
    let validationService: ValidationService;

    const testApiUrl = 'https://test-api.com/forecast';

    const mockConfigService = {
        get: jest.fn().mockReturnValue(testApiUrl)
    };

    const mockValidationService = {
        validateApiResponse: jest.fn()
    };

    const mockHttpService = {
        get: jest.fn()
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OpenMeteoApiService,
                { provide: ConfigService, useValue: mockConfigService },
                { provide: ValidationService, useValue: mockValidationService },
                { provide: HttpService, useValue: mockHttpService },
            ],
        }).compile();

        service = module.get<OpenMeteoApiService>(OpenMeteoApiService);
        httpService = module.get<HttpService>(HttpService);
        validationService = module.get<ValidationService>(ValidationService);
    });

    describe('fetchWeatherData', () => {
        it('pobiera dane pogodowe', async () => {
            const mockData = {
                daily: {
                    time: ['2024-01-01'],
                    temperature_2m_max: [15],
                    weather_code: [0]
                }
            };

            mockHttpService.get.mockReturnValue(of({ data: mockData }));
            mockValidationService.validateApiResponse.mockResolvedValue(mockData);

            const result = await service.fetchWeatherData(52.52, 13.41);

            expect(httpService.get).toHaveBeenCalledWith(
                testApiUrl,
                expect.objectContaining({
                    params: expect.objectContaining({
                        latitude: '52.52',
                        longitude: '13.41'
                    })
                })
            );
            expect(result).toBe(mockData);
        });

        it('obsługuje ujemne współrzędne', async () => {
            const mockData = { daily: {} };
            mockHttpService.get.mockReturnValue(of({ data: mockData }));
            mockValidationService.validateApiResponse.mockResolvedValue(mockData);

            await service.fetchWeatherData(-34.61, -58.38);

            expect(httpService.get).toHaveBeenCalledWith(
                testApiUrl,
                expect.objectContaining({
                    params: expect.objectContaining({
                        latitude: '-34.61',
                        longitude: '-58.38'
                    })
                })
            );
        });

        it('przekazuje prawidłowe parametry API', async () => {
            const mockData = { daily: {} };
            mockHttpService.get.mockReturnValue(of({ data: mockData }));
            mockValidationService.validateApiResponse.mockResolvedValue(mockData);

            await service.fetchWeatherData(50.0, 20.0);

            expect(httpService.get).toHaveBeenCalledWith(
                testApiUrl,
                expect.objectContaining({
                    params: {
                        latitude: '50',
                        longitude: '20',
                        daily: 'temperature_2m_max,temperature_2m_min,weather_code,shortwave_radiation_sum,sunshine_duration',
                        timezone: 'auto',
                        forecast_days: '7'
                    },
                    timeout: 5000
                })
            );
        });

        it('wywołuje ValidationService', async () => {
            const mockData = { daily: {} };
            mockHttpService.get.mockReturnValue(of({ data: mockData }));
            mockValidationService.validateApiResponse.mockResolvedValue(mockData);

            await service.fetchWeatherData(52.52, 13.41);

            expect(validationService.validateApiResponse).toHaveBeenCalledWith(
                mockData,
                expect.any(Function)
            );
        });
    });

    describe('fetchSummaryData', () => {
        it('pobiera dane podsumowania', async () => {
            const mockData = { daily: {} };
            mockHttpService.get.mockReturnValue(of({ data: mockData }));
            mockValidationService.validateApiResponse.mockResolvedValue(mockData);

            const result = await service.fetchSummaryData(40.0, -74.0);

            expect(httpService.get).toHaveBeenCalledWith(
                testApiUrl,
                expect.objectContaining({
                    params: expect.objectContaining({
                        latitude: '40',
                        longitude: '-74',
                        daily: 'temperature_2m_max,temperature_2m_min,weather_code,sunshine_duration,surface_pressure_mean'
                    })
                })
            );
            expect(result).toBe(mockData);
        });

        it('ustawia timeout na 5000ms', async () => {
            const mockData = { daily: {} };
            mockHttpService.get.mockReturnValue(of({ data: mockData }));
            mockValidationService.validateApiResponse.mockResolvedValue(mockData);

            await service.fetchSummaryData(52.52, 13.41);

            expect(httpService.get).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    timeout: 5000
                })
            );
        });

        it('używa URL z ConfigService', async () => {
            const mockData = { daily: {} };
            mockHttpService.get.mockReturnValue(of({ data: mockData }));
            mockValidationService.validateApiResponse.mockResolvedValue(mockData);

            await service.fetchSummaryData(52.52, 13.41);

            expect(mockConfigService.get).toHaveBeenCalledWith('app.openMeteoApiKey');
            expect(httpService.get).toHaveBeenCalledWith(testApiUrl, expect.any(Object));
        });
    });

    describe('error handling', () => {
        it('rzuca błąd 404', async () => {
            mockHttpService.get.mockReturnValue(throwError(() => ({
                response: { status: 404, statusText: 'Not Found' }
            })));

            await expect(service.fetchWeatherData(52.52, 13.41))
                .rejects
                .toThrow(WeatherApiNotFoundException);
        });

        it('rzuca błąd timeout', async () => {
            mockHttpService.get.mockReturnValue(throwError(() => ({
                code: 'ECONNABORTED'
            })));

            await expect(service.fetchWeatherData(52.52, 13.41))
                .rejects
                .toThrow(WeatherApiTimeoutException);
        });

        it('rzuca błąd sieciowy', async () => {
            mockHttpService.get.mockReturnValue(throwError(() => ({
                message: 'Network Error'
            })));

            await expect(service.fetchWeatherData(52.52, 13.41))
                .rejects
                .toThrow(WeatherApiException);
        });

        it('rzuca błąd 500', async () => {
            mockHttpService.get.mockReturnValue(throwError(() => ({
                response: { status: 500, statusText: 'Internal Server Error' }
            })));

            await expect(service.fetchWeatherData(52.52, 13.41))
                .rejects
                .toThrow(WeatherApiGatewayException);
        });

        it('rzuca błąd 400', async () => {
            mockHttpService.get.mockReturnValue(throwError(() => ({
                response: { status: 400, statusText: 'Bad Request' }
            })));

            await expect(service.fetchWeatherData(52.52, 13.41))
                .rejects
                .toThrow(WeatherApiGatewayException);
        });

        it('propaguje błędy z ValidationService', async () => {
            const mockData = { daily: {} };
            const validationError = new Error('Validation failed');

            mockHttpService.get.mockReturnValue(of({ data: mockData }));
            mockValidationService.validateApiResponse.mockRejectedValue(validationError);

            await expect(service.fetchWeatherData(52.52, 13.41))
                .rejects
                .toThrow('Validation failed');
        });
    });
});