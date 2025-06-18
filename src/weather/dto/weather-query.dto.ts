import { IsNumber, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';

export class WeatherQueryDto {
    @ApiProperty({
        description: 'Szerokość geograficzna',
        minimum: -90,
        maximum: 90,
        example: 52.52,
        type: 'number'
    })
    @IsNumber({}, { message: 'Latitude musi być liczbą' })
    @Min(-90, { message: 'Latitude musi być >= -90' })
    @Max(90, { message: 'Latitude musi być <= 90' })
    @Type(() => Number)
    latitude: number;

    @ApiProperty({
        description: 'Długość geograficzna',
        minimum: -180,
        maximum: 180,
        example: 13.41,
        type: 'number'
    })
    @IsNumber({}, { message: 'Longitude musi być liczbą' })
    @Min(-180, { message: 'Longitude musi być >= -180' })
    @Max(180, { message: 'Longitude musi być <= 180' })
    @Type(() => Number)
    longitude: number;
}