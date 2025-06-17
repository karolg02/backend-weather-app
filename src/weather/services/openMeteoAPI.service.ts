import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ValidationService } from "src/common/services/validation.service";
import { OpenMeteoWeatherResponseDto } from "../dto/open-meteo-data.dto";
import { OpenMeteoSummaryResponseDto } from "../dto/open-meteo-summary.dto";
import { firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { WeatherApiNotFoundException, WeatherApiGatewayException, WeatherApiException, WeatherApiTimeoutException } from "src/common/exceptions/exceptions";

@Injectable()
export class OpenMeteoApiService {
    private readonly openMeteoApiKey: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly validationService: ValidationService,
        private readonly httpService: HttpService
    ) {
        this.openMeteoApiKey = this.configService.get<string>('app.openMeteoApiKey')!;
    }

    async fetchWeatherData(latitude: number, longitude: number): Promise<OpenMeteoWeatherResponseDto> {
        const params = {
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            daily: 'temperature_2m_max,temperature_2m_min,weather_code,shortwave_radiation_sum,sunshine_duration',
            timezone: 'auto',
            forecast_days: '7'
        };

        const rawData = await this.makeApiCall(params);
        return await this.validationService.validateApiResponse<OpenMeteoWeatherResponseDto>(
            rawData,
            OpenMeteoWeatherResponseDto
        );
    }

    async fetchSummaryData(latitude: number, longitude: number): Promise<OpenMeteoSummaryResponseDto> {
        const params = {
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            daily: 'temperature_2m_max,temperature_2m_min,weather_code,sunshine_duration,surface_pressure_mean',
            timezone: 'auto',
            forecast_days: '7'
        };

        const rawData = await this.makeApiCall(params);
        return await this.validationService.validateApiResponse<OpenMeteoSummaryResponseDto>(
            rawData,
            OpenMeteoSummaryResponseDto
        );
    }

    private async makeApiCall(params: Record<string, string>): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(this.openMeteoApiKey, {
                    params,
                    timeout: 5000,
                })
            );

            return response.data;
        } catch (error) {
            if (error.response) {
                const { status, statusText } = error.response;

                switch (status) {
                    case 404:
                        throw new WeatherApiNotFoundException();
                    case 400:
                    case 422:
                        throw new WeatherApiGatewayException(status, statusText);
                    case 500:
                    case 502:
                    case 503:
                        throw new WeatherApiGatewayException(status, statusText);
                    default:
                        throw new WeatherApiException(`HTTP ${status}: ${statusText}`);
                }
            } else if (error.code === 'ECONNABORTED') {
                throw new WeatherApiTimeoutException();
            } else {
                throw new WeatherApiException(error.message);
            }
        }
    }
}