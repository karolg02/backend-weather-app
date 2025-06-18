import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('WeatherController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/weather (GET)', () => {
    it('zwraca prognozę pogody dla prawidłowych współrzędnych', () => {
      return request(app.getHttpServer())
        .get('/weather')
        .query({
          latitude: 52.52,
          longitude: 13.41
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).toHaveLength(7);

          const firstDay = res.body[0];
          expect(firstDay).toHaveProperty('date');
          expect(firstDay).toHaveProperty('weatherCode');
          expect(firstDay).toHaveProperty('minTemperature');
          expect(firstDay).toHaveProperty('maxTemperature');
          expect(firstDay).toHaveProperty('estimatedEnergy');

          expect(typeof firstDay.date).toBe('string');
          expect(typeof firstDay.weatherCode).toBe('number');
          expect(typeof firstDay.minTemperature).toBe('number');
          expect(typeof firstDay.maxTemperature).toBe('number');
          expect(typeof firstDay.estimatedEnergy).toBe('number');

          expect(firstDay.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(firstDay.estimatedEnergy).toBeGreaterThanOrEqual(0);
        });
    });

    it('zwraca błąd 400 dla nieprawidłowej latitude', () => {
      return request(app.getHttpServer())
        .get('/weather')
        .query({
          latitude: 91,
          longitude: 13.41
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('zwraca błąd 400 dla nieprawidłowej longitude', () => {
      return request(app.getHttpServer())
        .get('/weather')
        .query({
          latitude: 52.52,
          longitude: 181
        })
        .expect(400);
    });

    it('zwraca błąd 400 dla brakujących parametrów', () => {
      return request(app.getHttpServer())
        .get('/weather')
        .expect(400);
    });

    it('zwraca błąd 400 dla nieprawidłowych typów danych', () => {
      return request(app.getHttpServer())
        .get('/weather')
        .query({
          latitude: 'invalid',
          longitude: 13.41
        })
        .expect(400);
    });

    it('obsługuje ujemne współrzędne', () => {
      return request(app.getHttpServer())
        .get('/weather')
        .query({
          latitude: -34.61,
          longitude: -58.38
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(7);
          expect(res.body[0]).toHaveProperty('estimatedEnergy');
        });
    });

    it('obsługuje współrzędne na granicy zakresów', () => {
      return request(app.getHttpServer())
        .get('/weather')
        .query({
          latitude: 90,
          longitude: 180
        })
        .expect(200);
    });
  });

  describe('/weather/summarizeWeek (GET)', () => {
    it('zwraca podsumowanie tygodniowe', () => {
      return request(app.getHttpServer())
        .get('/weather/summarizeWeek')
        .query({
          latitude: 52.52,
          longitude: 13.41
        })
        .expect(200)
        .expect((res) => {
          const summary = res.body;

          expect(summary).toHaveProperty('averagePressure');
          expect(summary).toHaveProperty('averageExpositionTime');
          expect(summary).toHaveProperty('minTemperature');
          expect(summary).toHaveProperty('maxTemperature');
          expect(summary).toHaveProperty('weatherPrediction');

          expect(typeof summary.averagePressure).toBe('number');
          expect(typeof summary.averageExpositionTime).toBe('number');
          expect(typeof summary.minTemperature).toBe('number');
          expect(typeof summary.maxTemperature).toBe('number');
          expect(typeof summary.weatherPrediction).toBe('string');

          expect(summary.averagePressure).toBeGreaterThan(900);
          expect(summary.averagePressure).toBeLessThan(1100);
          expect(summary.averageExpositionTime).toBeGreaterThanOrEqual(0);
          expect(summary.averageExpositionTime).toBeLessThanOrEqual(24);
          expect(['z opadami', 'bez opadów']).toContain(summary.weatherPrediction);

          expect(summary.minTemperature).toBeLessThanOrEqual(summary.maxTemperature);
        });
    });

    it('zwraca błąd 400 dla nieprawidłowych parametrów', () => {
      return request(app.getHttpServer())
        .get('/weather/summarizeWeek')
        .query({
          latitude: 'invalid',
          longitude: 13.41
        })
        .expect(400);
    });

    it('obsługuje różne lokalizacje geograficzne', () => {
      return request(app.getHttpServer())
        .get('/weather/summarizeWeek')
        .query({
          latitude: 40.71,
          longitude: -74.01
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('weatherPrediction');
          expect(['z opadami', 'bez opadów']).toContain(res.body.weatherPrediction);
        });
    });
  });

  describe('Error Handling', () => {
    it('obsługuje błędy external API', async () => {
      const response = await request(app.getHttpServer())
        .get('/weather')
        .query({
          latitude: 0,
          longitude: 0
        });

      expect([200, 404, 408, 500, 502, 503]).toContain(response.status);
    });
  });

  describe('Response Headers', () => {
    it('zwraca prawidłowe Content-Type', () => {
      return request(app.getHttpServer())
        .get('/weather')
        .query({
          latitude: 52.52,
          longitude: 13.41
        })
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  describe('Query Parameter Edge Cases', () => {
    it('obsługuje float coordinates z wieloma miejscami po przecinku', () => {
      return request(app.getHttpServer())
        .get('/weather')
        .query({
          latitude: 52.520008,
          longitude: 13.404954
        })
        .expect(200);
    });

    it('obsługuje coordinates jako stringi', () => {
      return request(app.getHttpServer())
        .get('/weather')
        .query({
          latitude: '52.52',
          longitude: '13.41'
        })
        .expect(200);
    });
  });
});