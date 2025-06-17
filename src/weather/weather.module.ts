import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { ValidationService } from 'src/common/services/validation.service';

@Module({
    controllers: [WeatherController],
    providers: [WeatherService, ValidationService],
})
export class WeatherModule { }