import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SummaryDailyDataDto {
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
    sunshine_duration: number[];

    @IsArray()
    @IsNumber({}, { each: true })
    surface_pressure_mean: number[];
}

export class OpenMeteoSummaryResponseDto {
    @ValidateNested()
    @Type(() => SummaryDailyDataDto)
    daily: SummaryDailyDataDto;
}