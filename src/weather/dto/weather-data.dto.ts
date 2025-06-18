import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class WeatherDto {
    @ApiProperty({
        description: 'Data prognozy',
        example: '2025-06-18',
        type: 'string'
    })
    @IsString()
    @IsNotEmpty()
    date: string;

    @ApiProperty({
        description: 'Kod pogody (WMO Weather interpretation codes)',
        example: 0,
        type: 'number'
    })
    @IsNumber()
    weatherCode: number;

    @ApiProperty({
        description: 'Minimalna temperatura dnia (°C)',
        example: 5.2,
        type: 'number'
    })
    @IsNumber()
    minTemperature: number;

    @ApiProperty({
        description: 'Maksymalna temperatura dnia (°C)',
        example: 18.7,
        type: 'number'
    })
    @IsNumber()
    maxTemperature: number;

    @ApiProperty({
        description: 'Oszacowana produkcja energii słonecznej (kWh)',
        example: 2.45,
        type: 'number'
    })
    @IsNumber()
    estimatedEnergy: number;
}