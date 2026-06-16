# Weather App

Минималистичное погодное приложение: текущая погода, прогноз на 5 дней, геолокация, избранное, тёмная/светлая/авто тема, RU/EN. OpenWeather + React + TypeScript + Tailwind.

## Запуск

```bash
npm install
cp .env.example .env
# впишите свой VITE_OPENWEATHER_API_KEY (https://openweathermap.org/api)
npm run dev
```

## Команды

- `npm run dev` — dev-сервер (Vite, порт 5173)
- `npm run build` — production-сборка
- `npm run preview` — проверить билд локально
- `npm test` — Vitest
- `npm run test:coverage` — отчёт покрытия
- `npm run lint` — TypeScript + ESLint

## Архитектура

Слои: `presentation` / `application` / `infrastructure` / `domain`. Подробнее — `docs/superpowers/specs/2026-06-15-weather-app-design.md`.

## Стек

- Vite 5, React 18, TypeScript strict
- Tailwind CSS
- TanStack Query v5
- OpenWeather REST API
- Vitest + React Testing Library + MSW
