import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class WeatherDto {
    @IsString()
    @IsNotEmpty()
    date: string;
    @IsNumber()
    weatherCode: number;
    @IsNumber()
    minTemperature: number;
    @IsNumber()
    maxTemperature: number;
    @IsNumber()
    estimatedEnergy: number;
}