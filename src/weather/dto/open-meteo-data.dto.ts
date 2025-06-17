import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class WeatherDailyDataDto {
    @IsArray()
    @IsString({ each: true })
    time: string[];

    @IsArray()
    @IsNumber({}, { each: true })
    temperature_2m_max: number[];

    @IsArray()
    @IsNumber({}, { each: true })
    temperature_2m_min: number[];

    @IsArray()
    @IsNumber({}, { each: true })
    weather_code: number[];

    @IsArray()
    @IsNumber({}, { each: true })
    shortwave_radiation_sum: number[];

    @IsArray()
    @IsNumber({}, { each: true })
    sunshine_duration: number[];
}

export class OpenMeteoWeatherResponseDto {
    @ValidateNested()
    @Type(() => WeatherDailyDataDto)
    daily: WeatherDailyDataDto;
}