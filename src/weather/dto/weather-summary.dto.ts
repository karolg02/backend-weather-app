import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from "class-validator";

export class WeatherSummaryDto {
    @ApiProperty({
        description: 'Średnie ciśnienie atmosferyczne (hPa)',
        example: 1013.25,
        type: 'number'
    })
    @IsNumber()
    averagePressure: number;

    @ApiProperty({
        description: 'Średni czas nasłonecznienia (godziny)',
        example: 6.5,
        type: 'number'
    })
    @IsNumber()
    averageExpositionTime: number;

    @ApiProperty({
        description: 'Najniższa temperatura w okresie (°C)',
        example: -2.1,
        type: 'number'
    })
    @IsNumber()
    minTemperature: number;

    @ApiProperty({
        description: 'Najwyższa temperatura w okresie (°C)',
        example: 24.8,
        type: 'number'
    })
    @IsNumber()
    maxTemperature: number;

    @ApiProperty({
        description: 'Prognoza opadów na tydzień',
        example: 'bez opadów',
        enum: ['z opadami', 'bez opadów']
    })
    @IsString()
    @IsNotEmpty()
    weatherPrediction: string;
}