import { plainToInstance } from "class-transformer";
import { IsNotEmpty, IsString, IsUrl, validateSync } from "class-validator";

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
        throw new Error('Walidacja nie powiodła się: ' + errors.toString());
    }

    return validatedConfig;
}