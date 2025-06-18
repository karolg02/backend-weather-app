import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherDto } from './dto/weather-data.dto';
import { WeatherSummaryDto } from './dto/weather-summary.dto';
import { WeatherQueryDto } from './dto/weather-query.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) { }

  @Get()
  @ApiOperation({
    summary: 'Pobierz prognozę pogody na 7 dni',
    description: 'Zwraca szczegółową prognozę pogody wraz z oszacowaniem produkcji energii słonecznej'
  })
  @ApiResponse({
    status: 200,
    description: 'Pomyślnie pobrano dane pogodowe',
    type: [WeatherDto]
  })
  @ApiResponse({
    status: 400,
    description: 'Nieprawidłowe parametry (latitude/longitude poza zakresem)'
  })
  @ApiResponse({
    status: 404,
    description: 'Nie znaleziono danych pogodowych dla podanych współrzędnych'
  })
  @ApiResponse({
    status: 408,
    description: 'Timeout połączenia z API pogodowym'
  })
  async getWeather(@Query() query: WeatherQueryDto): Promise<WeatherDto[]> {
    return await this.weatherService.getWeatherInfo(query.latitude, query.longitude);
  }


  @Get('summarizeWeek')
  @ApiOperation({
    summary: 'Pobierz podsumowanie tygodniowe',
    description: 'Zwraca zagregowane dane pogodowe: średnie ciśnienie, czas nasłonecznienia, temperatury min/max i prognozę opadów'
  })
  @ApiResponse({
    status: 200,
    description: 'Pomyślnie pobrano podsumowanie tygodniowe',
    type: WeatherSummaryDto
  })
  @ApiResponse({
    status: 400,
    description: 'Nieprawidłowe parametry zapytania'
  })
  async getSummarize(@Query() query: WeatherQueryDto): Promise<WeatherSummaryDto> {
    return await this.weatherService.getWeatherSummary(query.latitude, query.longitude);
  }
}
