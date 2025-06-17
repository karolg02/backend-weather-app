import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { WeatherApiValidationException } from '../exceptions/exceptions';

@Injectable()
export class ValidationService {
    async validateApiResponse<T>(data: any, dtoClass: new () => T): Promise<T> {
        const transformedData = plainToClass(dtoClass, data);
        const errors = await validate(transformedData as any);

        if (errors.length > 0) {
            const errorMessages = errors.map(error =>
                Object.values(error.constraints || {}).join(', ')
            ).join('; ');

            throw new WeatherApiValidationException(errorMessages);
        }

        return transformedData;
    }
}