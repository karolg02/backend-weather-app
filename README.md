# 🌤️ Backend Weather App

### Backend Weather App to aplikacja NestJS, która:
- Pobiera dane pogodowe z OpenMeteo API poprzez podanie odpowiednich parametrów wejściowych
- Oblicza szacunkową produkcję energii słonecznej poprzez panele
- Generuje podsumowanie tygodniowie
- Zawiera dokumentację za pomocą Swagger'a

### Swagger UI
- **URL:** `http://localhost:3000/api`

### Endpointy

#### 🌤️ Prognoza pogody (7 dni)
- **URL:** `http://localhost:3000/weather`

#### 📊 Podsumowanie tygodniowe
- **URL:** `http://localhost:3000/weather/summarizeWeek`

### Parametry które muszą być podane

| Parametr | Typ | Zakres | Opis |
|----------|-----|--------|------|
| `latitude` | number | -90 do 90 | Szerokość geograficzna |
| `longitude` | number | -180 do 180 | Długość geograficzna |

## 🎯 Przykłady użycia

### cURL
```bash
# Prognoza dla Berlina
curl "http://localhost:3000/weather?latitude=52.52&longitude=13.41"

# Podsumowanie dla Warszawy
curl "http://localhost:3000/weather/summarizeWeek?latitude=52.23&longitude=21.01"
```

## Instalacja
```bash
# Sklonuj repo
git clone https://github.com/karolg02/backend-weather-app.git
cd backend-weather-app
```
## Konfiguracja

```bash
# pobranie zależności
$ npm install
# dodanie zmiennych środowiskowych
```

## Przykładowa zawartość pliku .env
```bash
OPEN_METEO_API_KEY=twojApiKey
PORT=3000
```

## Uruchamianie

```bash
# development
$ npm run start
# watch mode
$ npm run start:dev
# production mode
$ npm run start:prod
```

## Uruchamianie testów

```bash
# unit tests
$ npm run test
# e2e tests
$ npm run test:e2e
# test coverage
$ npm run test:cov
```