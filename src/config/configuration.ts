export default () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    openMeteoApiUrl: process.env.OPEN_METEO_API_URL
});