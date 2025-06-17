import { registerAs } from "@nestjs/config";

export default registerAs('app', () => {
    const openMeteoApiKey = process.env.OPEN_METEO_API_KEY;

    if (!openMeteoApiKey) {
        throw new Error('OPEN_METEO_API_KEY jest nie ustawiony w zmiennych środowiskowych');
    }
    return {
        port: parseInt(process.env.PORT || '3000', 10),
        openMeteoApiKey,
    };
});