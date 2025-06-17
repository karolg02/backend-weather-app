import { IsNumber, Max, Min } from "class-validator";
import { Type } from 'class-transformer';
export class WeatherQueryDto {
    @Type(() => Number)
    @IsNumber()
    @Min(-90, { message: 'Latitude musi być w zakresie -90 do 90' })
    @Max(90, { message: 'Latitude musi być w zakresie -90 do 90' })
    latitude: number;

    @Type(() => Number)
    @IsNumber()
    @Min(-180, { message: 'Longitude musi być w zakresie -180 do 180' })
    @Max(180, { message: 'Longitude musi być w zakresie -180 do 180' })
    longitude: number;
}