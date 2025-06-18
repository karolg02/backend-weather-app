import { registerAs } from "@nestjs/config";
import { ErrorCodes } from "src/common/constants/error-codes";
import { ConfigurationException } from "src/common/exceptions/exceptions";

export default registerAs('app', () => {
    const openMeteoApiKey = process.env.OPEN_METEO_API_KEY;

    if (!openMeteoApiKey) {
        throw new ConfigurationException(
            ErrorCodes.MISSING_ENV_VARIABLE,
            ['OPEN_METEO_API_KEY']
        );
    }
    return {
        port: parseInt(process.env.PORT || '3000', 10),
        openMeteoApiKey,
    };
});