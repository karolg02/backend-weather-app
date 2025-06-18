import { BadGatewayException, BadRequestException, HttpException, HttpStatus, InternalServerErrorException, NotFoundException, RequestTimeoutException } from "@nestjs/common";
import { ErrorCodes } from "../constants/error-codes";
export class WeatherApiValidationException extends BadRequestException {
    constructor(errorCode: ErrorCodes, details: string[] = []) {
        super({
            type: errorCode,
            details
        });
    }
}

export class WeatherApiNotFoundException extends NotFoundException {
    constructor() {
        super({
            type: ErrorCodes.WEATHER_DATA_NOT_FOUND,
            details: []
        });
    }
}

export class WeatherApiTimeoutException extends RequestTimeoutException {
    constructor() {
        super({
            type: ErrorCodes.WEATHER_API_TIMEOUT,
            details: []
        });
    }
}

export class WeatherApiException extends HttpException {
    constructor(errorCode: ErrorCodes = ErrorCodes.WEATHER_API_ERROR, details: string[] = []) {
        super({
            type: errorCode,
            details
        }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export class WeatherApiGatewayException extends BadGatewayException {
    constructor(statusCode: number, statusText: string) {
        super({
            type: ErrorCodes.WEATHER_API_GATEWAY_ERROR,
            details: [`HTTP ${statusCode}: ${statusText}`]
        });
    }
}

export class ConfigurationException extends InternalServerErrorException {
    constructor(errorCode: ErrorCodes, details: string[] = []) {
        super({
            type: errorCode,
            details
        });
    }
}

export class WeatherCalculationException extends BadRequestException {
    constructor(errorCode: ErrorCodes, details: string[] = []) {
        super({
            type: errorCode,
            details
        });
    }
}