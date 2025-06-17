import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OpenMeteoWeatherResponseDto {
    @ValidateNested()
    @Type(() => WeatherDailyDataDto)
    daily: WeatherDailyDataDto;
}

export class WeatherDailyDataDto {
    @IsArray()
    @IsString({ each: true })
    time: string[];

    @IsArray()
    @IsNumber(undefined, { each: true })
    temperature_2m_max: number[];

    @IsArray()
    @IsNumber(undefined, { each: true })
    temperature_2m_min: number[];

    @IsArray()
    @IsNumber(undefined, { each: true })
    weather_code: number[];

    @IsArray()
    @IsNumber(undefined, { each: true })
    shortwave_radiation_sum: number[];

    @IsArray()
    @IsNumber(undefined, { each: true })
    sunshine_duration: number[];
}