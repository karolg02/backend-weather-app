import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) { }

  @Get()
  async getWeather(@Query('latitude') latitude: number, @Query('longitude') longitude: number): Promise<any> {
    return await this.weatherService.getWeatherInfo(latitude, longitude);
  }

  @Get('summarizeWeek')
  async getSummarize(@Query('latitude') latitude: number, @Query('longitude') longitude: number): Promise<any> {
    return await this.weatherService.getWeatherSummary(latitude, longitude);
  }
}
