import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('weather')
  async getWeather(@Query('latitude') latitude: number, @Query('longitude') longitude: number): Promise<any> {
    return await this.appService.getWeatherInfo(latitude, longitude);
  }

  @Get('summarizeWeek')
  async getSummarize(@Query('latitude') latitude: number, @Query('longitude') longitude: number): Promise<any> {
    return await this.appService.getWeatherSummary(latitude, longitude);
  }
}
