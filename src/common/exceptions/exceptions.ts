import { BadGatewayException, BadRequestException, HttpException, HttpStatus, InternalServerErrorException, NotFoundException, RequestTimeoutException } from "@nestjs/common";

export class WeatherApiValidationException extends BadRequestException {
    constructor(validationErrors: string) {
        super({
            type: 'WEATHER_API_VALIDATION_ERROR',
            details: [validationErrors]
        });
    }
}

export class WeatherApiNotFoundException extends NotFoundException {
    constructor() {
        super({
            type: 'WEATHER_DATA_NOT_FOUND',
            details: ['Nie znaleziono danych pogodowych dla podanych współrzędnych']
        });
    }
}

export class WeatherApiTimeoutException extends RequestTimeoutException {
    constructor() {
        super({
            type: 'WEATHER_API_TIMEOUT',
            details: ['Przekroczono limit czasu połączenia z API pogodowym']
        });
    }
}

export class WeatherApiException extends HttpException {
    constructor(message: string = 'Błąd podczas komunikacji z API pogodowym') {
        super({
            type: 'WEATHER_API_ERROR',
            details: [message]
        }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export class WeatherApiGatewayException extends BadGatewayException {
    constructor(statusCode: number, statusText: string) {
        super({
            type: 'WEATHER_API_GATEWAY_ERROR',
            details: [`Zewnętrzne API pogodowe zwróciło błąd: ${statusCode} - ${statusText}`]
        });
    }
}

export class ConfigurationException extends InternalServerErrorException {
    constructor(validationErrors: string[]) {
        super({
            type: 'CONFIGURATION_ERROR',
            details: [validationErrors]
        });
    }
}