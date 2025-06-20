import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { ValidationService } from '../common/services/validation.service';
import { OpenMeteoApiService } from './services/open-meteo-api.service';
import { HttpModule } from '@nestjs/axios';
import { WeatherCalculationService } from './services/weather-calculation.service';

@Module({
    imports: [
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 5,
        }),
    ],
    controllers: [WeatherController],
    providers: [WeatherService, ValidationService, OpenMeteoApiService, WeatherCalculationService],
})
export class WeatherModule { }