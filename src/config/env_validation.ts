import { plainToInstance } from "class-transformer";
import { IsNotEmpty, IsString, IsUrl, validateSync } from "class-validator";
import { ErrorCodes } from "../common/constants/error-codes";
import { ConfigurationException } from "../common/exceptions/exceptions";

class EnvironmentVariables {
    @IsString()
    @IsNotEmpty()
    PORT: string = '3000';

    @IsUrl()
    @IsNotEmpty()
    OPEN_METEO_API_KEY: string;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, { skipMissingProperties: false });
    if (errors.length > 0) {
        const errorDetails = errors.map(error => {
            const constraints = Object.values(error.constraints || {});
            return `${error.property}: ${constraints.join(', ')}`;
        });

        throw new ConfigurationException(
            ErrorCodes.CONFIGURATION_ERROR,
            errorDetails
        );
    }

    return validatedConfig;
}