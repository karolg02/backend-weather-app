import { Injectable } from '@nestjs/common';
import { WeatherDto } from './dto/weather-data.dto';
import { WeatherSummaryDto } from './dto/weather-summary.dto';
import { WeatherCalculationService } from './services/weather-calculation.service';
import { OpenMeteoApiService } from './services/open-meteo-api.service';

@Injectable()
export class WeatherService {
  constructor(
    private readonly weatherCalculationService: WeatherCalculationService,
    private readonly openMeteoApiService: OpenMeteoApiService
  ) { }

  async getWeatherInfo(latitude: number, longitude: number): Promise<WeatherDto[]> {
    const data = await this.openMeteoApiService.fetchWeatherData(latitude, longitude);
    const estimateGeneratedEnergy = this.weatherCalculationService.getEstimateGeneratedEnergy(data.daily.sunshine_duration);

    const weeklyData: WeatherDto[] = data.daily.time.map((date: string, index: number) => ({
      date,
      weatherCode: data.daily.weather_code[index],
      minTemperature: data.daily.temperature_2m_min[index],
      maxTemperature: data.daily.temperature_2m_max[index],
      estimatedEnergy: Math.round(estimateGeneratedEnergy[index] * 100) / 100
    }));

    return weeklyData;
  }

  async getWeatherSummary(latitude: number, longitude: number): Promise<WeatherSummaryDto> {
    const data = await this.openMeteoApiService.fetchSummaryData(latitude, longitude);

    const avgPressure = this.weatherCalculationService.calculateAverage(data.daily.surface_pressure_mean);
    const avgExpositionTimeSeconds = this.weatherCalculationService.calculateAverage(data.daily.sunshine_duration);
    const avgExpositionTime = avgExpositionTimeSeconds / 3600; // [s] -> [h]

    const minTemperature = Math.min(...data.daily.temperature_2m_min);
    const maxTemperature = Math.max(...data.daily.temperature_2m_max);
    const weatherPrediction = this.weatherCalculationService.getWeatherPrediction(data.daily.weather_code);

    const summarizeWeeklyData: WeatherSummaryDto = {
      // zaokraglanie wynikow
      averagePressure: Math.round(avgPressure * 100) / 100,
      averageExpositionTime: Math.round(avgExpositionTime * 100) / 100,
      minTemperature: Math.round(minTemperature * 10) / 10,
      maxTemperature: Math.round(maxTemperature * 10) / 10,
      weatherPrediction
    };

    return summarizeWeeklyData;
  }
}