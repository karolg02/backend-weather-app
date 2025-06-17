import { IsNumber, IsString, IsNotEmpty } from "class-validator";

export class WeatherSummaryDto {
    @IsNumber()
    averagePressure: number;
    @IsNumber()
    averageExpositionTime: number;
    @IsNumber()
    minTemperature: number;
    @IsNumber()
    maxTemperature: number;
    @IsString()
    @IsNotEmpty()
    weatherPrediction: string;
}