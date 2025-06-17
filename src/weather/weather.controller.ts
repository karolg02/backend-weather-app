import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherDto } from './dto/weather-data.dto';
import { WeatherSummaryDto } from './dto/weather-summary.dto';
import { WeatherQueryDto } from './dto/weather-query.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) { }

  @Get()
  async getWeather(@Query() query: WeatherQueryDto): Promise<WeatherDto[]> {
    return await this.weatherService.getWeatherInfo(query.latitude, query.longitude);
  }

  @Get('summarizeWeek')
  async getSummarize(@Query() query: WeatherQueryDto): Promise<WeatherSummaryDto> {
    return await this.weatherService.getWeatherSummary(query.latitude, query.longitude);
  }
}
