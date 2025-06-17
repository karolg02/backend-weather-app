import { Injectable } from "@nestjs/common";
import { PRECIPITATION_CODES } from "src/common/constants/weather-codes";

@Injectable()
export class WeatherCalculationService {
    getEstimateGeneratedEnergy(sunshine_duration: number[]) {
        // dane z zadania
        // efektywność paneli = 0.2
        const panels_efficency = 0.2;
        // moc instalacji fotowoltaicznej = 2,5 kW
        const panels_power = 2.5;
        return sunshine_duration.map(duration => {
            const hours = duration / 3600; //[s] to [h]
            // energia[kWh] = moc instalacji[kW] x czas ekspozycji[h] x efektywność paneli
            return panels_power * hours * panels_efficency;
        });
    }
    calculateAverage(values: number[]): number {
        const sum = values.reduce((acc, val) => acc + val, 0);
        if (values.length === 0) {
            return 0;
        }
        return sum / values.length;
    }
    getWeatherPrediction(weatherCodes: number[]): string {

        const precipitationCodes = PRECIPITATION_CODES;

        const rainyDaysCount = weatherCodes.filter(code =>
            precipitationCodes.includes(code)
        ).length;

        return rainyDaysCount >= 4 ? "z opadami" : "bez opadów";
    }
}