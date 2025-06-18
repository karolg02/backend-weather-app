import { Test, TestingModule } from '@nestjs/testing';
import { WeatherCalculationService } from '../../src/weather/services/weatherCalculation.service';

describe('WeatherCalculationService', () => {
    let service: WeatherCalculationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [WeatherCalculationService],
        }).compile();

        service = module.get<WeatherCalculationService>(WeatherCalculationService);
    });

    it('jest zdefiniowany', () => {
        expect(service).toBeDefined();
    });

    describe('getEstimateGeneratedEnergy', () => {
        it('oblicza energię dla 1 godziny słońca', () => {
            const result = service.getEstimateGeneratedEnergy([3600]);

            expect(result[0]).toBeCloseTo(0.5, 2);
        });

        it('oblicza energię dla kilku dni', () => {
            const result = service.getEstimateGeneratedEnergy([3600, 7200, 10800]);

            expect(result).toEqual([0.5, 1.0, 1.5]);
        });

        it('zwraca 0 gdy brak słońca', () => {
            const result = service.getEstimateGeneratedEnergy([0]);

            expect(result[0]).toBe(0);
        });

        it('obsługuje pustą tablicę', () => {
            const result = service.getEstimateGeneratedEnergy([]);

            expect(result).toEqual([]);
        });

        it('oblicza energię dla całego dnia nasłonecznienia', () => {
            const result = service.getEstimateGeneratedEnergy([43200]);

            expect(result[0]).toBeCloseTo(6.0, 2);
        });

        it('używa prawidłowych stałych', () => {
            const result = service.getEstimateGeneratedEnergy([14400]);

            expect(result[0]).toBe(2.0);
        });

        it('obsługuje ułamkowe godziny', () => {
            const result = service.getEstimateGeneratedEnergy([1800]);

            expect(result[0]).toBeCloseTo(0.25, 2);
        });
    });

    describe('calculateAverage', () => {
        it('oblicza średnią z liczb', () => {
            const result = service.calculateAverage([10, 20, 30]);

            expect(result).toBe(20);
        });

        it('działa z jedną wartością', () => {
            const result = service.calculateAverage([42]);

            expect(result).toBe(42);
        });

        it('obsługuje liczby ujemne', () => {
            const result = service.calculateAverage([-10, 0, 10]);

            expect(result).toBe(0);
        });

        it('obsługuje liczby dziesiętne', () => {
            const result = service.calculateAverage([1.5, 2.5, 3.0]);

            expect(result).toBeCloseTo(2.33, 2);
        });

        it('oblicza średnią temperatur', () => {
            const temperatures = [18.5, 22.3, 19.8, 21.1, 20.0];
            const result = service.calculateAverage(temperatures);

            expect(result).toBeCloseTo(20.34, 2);
        });

        it('obsługuje duże tablice', () => {
            const largeArray = Array(100).fill(5);
            const result = service.calculateAverage(largeArray);

            expect(result).toBe(5);
        });
    });

    describe('getWeatherPrediction', () => {
        it('przewiduje opady gdy >=4 deszczowe dni', () => {
            const result = service.getWeatherPrediction([61, 63, 65, 80]);

            expect(result).toBe('z opadami');
        });

        it('przewiduje brak opadów gdy mniej niż 4 deszczowe dni', () => {
            const result = service.getWeatherPrediction([0, 1, 2, 61]);

            expect(result).toBe('bez opadów');
        });

        it('rozpoznaje różne typy opadów', () => {
            const result = service.getWeatherPrediction([51, 61, 71, 95]);

            expect(result).toBe('z opadami');
        });

        it('obsługuje przypadek graniczny - dokładnie 4 dni', () => {
            const result = service.getWeatherPrediction([0, 61, 63, 65, 80]);

            expect(result).toBe('z opadami');
        });

        it('obsługuje 7-dniową prognozę', () => {
            const result = service.getWeatherPrediction([0, 1, 2, 3, 61, 63, 65]);

            expect(result).toBe('bez opadów');
        });

        it('obsługuje pojedynczy dzień', () => {
            const result = service.getWeatherPrediction([61]);

            expect(result).toBe('bez opadów');
        });
    });
});