import { registerAs } from "@nestjs/config";
import { ConfigurationException } from "src/common/exceptions/exceptions";

export default registerAs('app', () => {
    const openMeteoApiKey = process.env.OPEN_METEO_API_KEY;

    if (!openMeteoApiKey) {
        throw new ConfigurationException([
            'OPEN_METEO_API_KEY jest nie ustawiony w zmiennych środowiskowych'
        ]);
    }
    return {
        port: parseInt(process.env.PORT || '3000', 10),
        openMeteoApiKey,
    };
});