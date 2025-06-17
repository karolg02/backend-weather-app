import { Injectable } from '@nestjs/common';
import { WeatherDto } from './dto/weather-data.dto';
import { OpenMeteoWeatherResponseDto } from './dto/open-meteo-data.dto';
import { OpenMeteoSummaryResponseDto } from './dto/open-meteo-summary.dto';

import { WeatherSummaryDto } from './dto/weather-summary.dto';
import { PRECIPITATION_CODES } from 'src/common/constants/weather-codes';

@Injectable()
export class WeatherService {
  async getWeatherInfo(latitude: number, longitude: number): Promise<WeatherDto[]> {
    // w razie potrzeby latwo mozna dodac wiecej parametrow
    const params = {
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,shortwave_radiation_sum,sunshine_duration',
      timezone: 'auto',
      forecast_days: '7'
    }

    const url = `${process.env.OPEN_METEO_API_KEY}?${new URLSearchParams(params).toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Nie udało się pobrać danych z zewnętrznego API, kod błędu: ${response.status}`);
      }
      const data: OpenMeteoWeatherResponseDto = await response.json();
      const estimateGeneratedEnergy = this.getEstimateGeneratedEnergy(data.daily.sunshine_duration);

      const weeklyData: WeatherDto[] = data.daily.time.map((date: string, index: number) => {
        return {
          date,
          weatherCode: data.daily.weather_code[index],
          minTemperature: data.daily.temperature_2m_min[index],
          maxTemperature: data.daily.temperature_2m_max[index],
          estimatedEnergy: estimateGeneratedEnergy[index]
        }
      });

      return weeklyData

    } catch (error) {
      throw error;
    }
  }

  private getEstimateGeneratedEnergy(sunshine_duration: number[]) {
    //dane z zadania
    const panels_efficency = 0.2;
    const panels_power = 2.5;
    return sunshine_duration.map(duration => {
      const hours = duration / 3600; //[s] to [h]
      // energia[kWh] = moc instalacji[kW] x czas ekspozycji[h] x efektywność paneli
      return panels_power * hours * panels_efficency;
    });
  }

  async getWeatherSummary(latitude: number, longitude: number): Promise<WeatherSummaryDto> {
    // w razie potrzeby latwo mozna dodac wiecej parametrow
    const params = {
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,sunshine_duration,surface_pressure_mean',
      timezone: 'auto',
      forecast_days: '7'
    }
    const url = `${process.env.OPEN_METEO_API_KEY}?${new URLSearchParams(params).toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Nie udało się pobrać danych z zewnętrznego API, kod błędu: ${response.status}`);
      }
      const data: OpenMeteoSummaryResponseDto = await response.json();
      // srednie
      const avgPressure = this.calculateAverage(data.daily.surface_pressure_mean);
      const avgExpositionTime = this.calculateAverage(data.daily.sunshine_duration) / 3600; //[s] to [h]
      // skrajne temperatury
      const minTemperature = Math.min(...data.daily.temperature_2m_min);
      const maxTemperature = Math.max(...data.daily.temperature_2m_max);
      //podsumowanie pogody
      const weatherPrediction = this.getWeatherPrediction(data.daily.weather_code);

      const summarizeWeeklyData: WeatherSummaryDto = {
        averagePressure: avgPressure,
        averageExpositionTime: avgExpositionTime,
        minTemperature: minTemperature,
        maxTemperature: maxTemperature,
        weatherPrediction: weatherPrediction
      }

      return summarizeWeeklyData;

    } catch (error) {
      throw error;
    }
  }

  private calculateAverage(values: number[]): number {
    const sum = values.reduce((acc, val) => acc + val, 0);
    if (values.length === 0) {
      return 0;
    }
    return sum / values.length;
  }

  private getWeatherPrediction(weatherCodes: number[]): any {

    const precipitationCodes = PRECIPITATION_CODES;

    const rainyDaysCount = weatherCodes.filter(code =>
      precipitationCodes.includes(code)
    ).length;

    return rainyDaysCount >= 4 ? "z opadami" : "bez opadów";
  }
}