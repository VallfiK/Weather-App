# Weather App — Дизайн-спецификация

**Дата:** 2026-06-15
**Статус:** Утверждён (ждёт финального ревью пользователем)
**Область:** MVP (без PRO-фич)

## 1. Цель и область

Веб-приложение «Погода» для отображения текущей погоды и прогноза на 5 дней для любого города мира. Фокус — скорость, минимализм, корректная работа на мобильных и десктопе.

**В scope MVP:**
- Поиск города с автодополнением
- Текущая погода (T, ощущается, состояние, иконка, влажность, ветер, давление)
- Прогноз на 5 дней (агрегированный из 3-часовых блоков)
- Почасовой прогноз на 4–6 часов вперёд
- Геолокация по кнопке «Погода рядом»
- Избранные города с быстрым переключением
- Тёмная / светлая / авто тема
- Локализация RU / EN с автоопределением
- Mobile First, адаптив 375 / 768 / 1280
- Корректная обработка ошибок API

**Вне scope (явно отложено):**
- Графики температуры, анимации погоды, PWA, уведомления, переключение °C/°F — оставляем место в архитектуре, реализация в следующих итерациях.

## 2. Стек

- **Vite + React 18 + TypeScript (strict)**
- **Tailwind CSS** с `darkMode: ['selector', '[data-theme="dark"]']`
- **TanStack Query** для кеша и синхронизации серверных данных
- **OpenWeather API** (бесплатный тариф, ключ через `.env`)
- **Vitest + React Testing Library + MSW** для тестов
- Никаких глобальных стейт-менеджеров (Redux/Zustand) — хватает Context + TanStack Query

## 3. Архитектура — четыре слоя

```
┌─────────────────────────────────────────┐
│  presentation  — React-компоненты, UI  │
└───────────────▲─────────────────────────┘
                │ использует хуки
┌───────────────┴─────────────────────────┐
│  application  — хуки, контексты,        │
│                координация               │
└───────────────▲─────────────────────────┘
                │ вызывает сервисы
┌───────────────┴─────────────────────────┐
│  infrastructure  — OpenWeather клиент,  │
│                    LocalStorage           │
└───────────────▲─────────────────────────┘
                │ реализует контракты
┌───────────────┴─────────────────────────┐
│  domain  — типы, DTO, интерфейсы,       │
│            маппинг weather codes         │
└─────────────────────────────────────────┘
```

**Правила зависимостей:** `domain` ни от чего не зависит. `infrastructure` зависит только от `domain`. `application` — от `domain` и `infrastructure`. `presentation` — от `application` и `domain`. Обратных зависимостей нет.

## 4. Структура каталогов

```
src/
  presentation/
    components/
      SearchBar.tsx
      CitySuggestions.tsx
      FavoritesChips.tsx
      FavoriteChip.tsx
      CurrentWeatherCard.tsx
      WeatherIcon.tsx
      MetricsGrid.tsx
      Metric.tsx
      HourlyList.tsx
      HourlyItem.tsx
      ForecastStrip.tsx
      ForecastDay.tsx
      GeolocationButton.tsx
      ErrorBanner.tsx
    pages/
      HomePage.tsx
    layouts/
      AppLayout.tsx
    ui/                # переиспользуемые примитивы
      Button.tsx
      IconButton.tsx
      Input.tsx
      Spinner.tsx
      Card.tsx
      Skeleton.tsx
    hooks/
      useDebounce.ts
      useGeolocation.ts
  application/
    hooks/
      useWeather.ts
      useCitySearch.ts
      useFavorites.ts
    context/
      FavoritesContext.tsx
      ThemeContext.tsx
      LanguageContext.tsx
    i18n/
      ru.ts
      en.ts
      I18nProvider.tsx
      useTranslation.ts
      plural.ts
  infrastructure/
    api/
      httpClient.ts
      weatherService.ts
      geocodingService.ts
    storage/
      localStorage.ts
  domain/
    types.ts
    mappers.ts
    weatherCodes.ts
  config/
    env.ts
  main.tsx
  App.tsx
  index.css
```

## 5. Доменные типы и контракты

`src/domain/types.ts`:
```ts
export interface City {
  id: string;        // стабильный: `${name},${country},${lat.toFixed(2)},${lon.toFixed(2)}`
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export type WeatherCode =
  | 'clear' | 'partlyCloudy' | 'cloudy' | 'overcast'
  | 'fog' | 'drizzle' | 'rain' | 'heavyRain'
  | 'snow' | 'heavySnow' | 'sleet' | 'thunderstorm';

export interface Weather {
  temp: number;
  feelsLike: number;
  condition: WeatherCode;
  description: string;   // локализованное из API или наше
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  uvIndex: number;
  observedAt: Date;
  sunrise: Date;
  sunset: Date;
}

export interface ForecastDay {
  date: Date;
  min: number;
  max: number;
  condition: WeatherCode;
  description: string;
}

export interface HourlyPoint {
  time: Date;
  temp: number;
  condition: WeatherCode;
}

export type ApiError =
  | { kind: 'network' }
  | { kind: 'notFound' }
  | { kind: 'rateLimit' }
  | { kind: 'unauthorized' }
  | { kind: 'server'; status: number };
```

`src/domain/mappers.ts` отвечает за конвертацию ответов OpenWeather в эти типы. UI никогда не видит «сырой» формат API.

## 6. Слой данных

**Endpoints (бесплатный тариф OpenWeather):**
- `GET /geo/1.0/direct?q={city}&limit=5&lang={ru|en}` — автодополнение
- `GET /geo/1.0/reverse?lat&lon&limit=1` — координаты → название
- `GET /data/2.5/weather?lat&lon&units=metric&lang={ru|en}` — текущая
- `GET /data/2.5/forecast?lat&lon&units=metric&lang={ru|en}` — 5 дней / 3 часа

**Кеш (TanStack Query):**

| Запрос | staleTime | gcTime |
|---|---|---|
| Текущая погода | 10 мин | 30 мин |
| Прогноз 5 дней | 30 мин | 1 час |
| Геокодинг (suggest / reverse) | 24 часа | 7 дней |

Ключи запросов включают координаты/город + язык + units, чтобы переключение языка не подсовывало кешированные ответы со старым `lang`.

**Маппинг forecast:** 3-часовые блоки группируются по локальной дате, берётся min/max температуры, дневной режим — блок ближайший к 12:00 (определяет иконку дня).

**AbortController** на каждый запрос — TanStack Query отменяет устаревшие запросы при смене города.

**`httpClient`** нормализует HTTP-ошибки в `ApiError`:
- сетевая ошибка fetch → `network`
- 404 → `notFound`
- 401 → `unauthorized`
- 429 → `rateLimit`
- 5xx → `server` с `status`

**API-ключ:** `VITE_OPENWEATHER_API_KEY` через `import.meta.env`. Если не задан — приложение показывает баннер «API ключ не настроен» и блокирует запросы. В репозитории лежит `.env.example`.

## 7. Управление состоянием

| Состояние | Расположение | Персистентность |
|---|---|---|
| Избранные города + selectedId | `FavoritesContext` | LocalStorage `weather-app:favorites:v1` |
| Тема | `ThemeContext` | LocalStorage `weather-app:theme:v1` |
| Язык | `LanguageContext` | LocalStorage `weather-app:lang:v1` |
| Серверные данные | TanStack Query cache | Только в памяти |
| UI-локальное (input, открыт ли dropdown) | `useState` в компоненте | Нет |

**`FavoritesContext` API:**
```ts
interface FavoritesContextValue {
  cities: City[];
  selectedId: string | null;
  selectedCity: City | null;
  add(city: City): void;
  remove(id: string): void;
  select(id: string): void;
  isFavorite(id: string): boolean;
}
```
При первом запуске, если нет избранного — подставляется Москва как дефолт. Поиск нового города не добавляет его автоматически — только через ⭐.

**`ThemeContext`:** три значения `light | dark | auto`. `auto` слушает `matchMedia('(prefers-color-scheme: dark)')`. Применяется через `document.documentElement.setAttribute('data-theme', value)`.

**`LanguageContext` + i18n:** плоские словари `ru.ts` / `en.ts`, ключи через точку. Хук `useTranslation()` возвращает функцию `t(key, vars?)`. Плюрализация через утилиту `pluralRu(n, ['день','дня','дней'])`. Дефолтный язык берётся из `navigator.language`: `ru*` → `ru`, остальные → `en`.

**`useWeather(cityId)`:**
```ts
{
  current: Weather | null;
  forecast: { daily: ForecastDay[]; hourly: HourlyPoint[] } | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  lastUpdated: Date | null;
}
```
- Два внутренних `useQuery` (current + forecast), ключи включают `cityId + lang + units`
- `enabled: !!cityId` — без выбранного города запросов нет
- `error` пробрасывается в `ErrorBanner` с локализованным сообщением по `kind`

## 8. UI / UX

**Главный экран (макет C — плотный, выбран пользователем):**
- Шапка: `SearchBar` + `GeolocationButton` + переключатели темы и языка
- Под шапкой: `FavoritesChips` (горизонтальный скролл)
- Двухколоночная сетка (на десктопе): слева `CurrentWeatherCard` + `MetricsGrid`, справа `HourlyList` + `ForecastStrip`
- На мобильном (< 768px): одноколоночная стопка, чипы скроллятся горизонтально
- Ошибки и загрузка: `ErrorBanner` сверху результата, `Skeleton` во время первой загрузки

**Стиль:**
- Tailwind, минимализм, большие цифры температуры (font-weight 100-200, размер до 96px на десктопе)
- Иконки погоды — собственный SVG-словарь в `domain/weatherCodes.ts`, размеры 24/48/96
- Тёмная тема — основной акцент; фоны с лёгким градиентом
- Светлая — белые/серые карточки на светло-сером фоне

**Переходы:** минимальные, fade-in 200ms на смене города, без анимаций (PRO-фича).

**Доступность:** семантические теги, ARIA-лейблы на иконках без текста, `prefers-reduced-motion` уважается, focus-visible стили.

## 9. Тестирование

| Уровень | Покрытие | Инструмент |
|---|---|---|
| Unit | `mappers.ts`, `weatherCodes.ts`, `plural.ts`, `i18n` | Vitest |
| Component | `WeatherIcon`, `Metric`, `ForecastDay`, `SearchBar` (suggestions) | Vitest + RTL |
| Хуки | `useWeather` (loading/error/success), `useDebounce` | Vitest + RTL |
| E2E (опционально) | Поиск → отображение → добавление в избранное | Playwright |

Сетевой слой тестируется через MSW — детерминированные ответы на 200/401/404/429/500 без обращения к реальному API.

**Табличный тест `weatherCodes.ts`** на 50+ кейсов (sun, clouds, rain, snow, thunderstorm, mist и т.д.) — проверяем корректность иконки и перевода.

## 10. Критерии готовности (Definition of Done)

- ✅ Поиск работает с автодополнением, обрабатывает «город не найден»
- ✅ Текущая погода отображает все поля из ТЗ: T, ощущается, состояние, иконка, влажность, ветер, давление, время обновления
- ✅ Прогноз на 5 дней с min/max, иконкой, описанием, днём недели
- ✅ Избранные города: добавление через ⭐, переключение кликом по чипу, удаление, сохранение в LocalStorage
- ✅ Геолокация по кнопке, обработка отказа
- ✅ Темная / светлая / авто тема с переключателем
- ✅ RU / EN с автоопределением из `navigator.language`
- ✅ Mobile First — корректное отображение на 375 / 768 / 1280
- ✅ Корректные ошибки: город не найден, нет сети, лимит API, нет ключа
- ✅ Unit и component тесты зелёные
- ✅ `npm run build` собирается без ошибок и предупреждений
- ✅ README с инструкцией запуска, переменными окружения, скриншотами

## 11. Команды разработки

- `npm run dev` — Vite dev server
- `npm run build` — production-сборка
- `npm run preview` — проверка билда локально
- `npm run test` — Vitest
- `npm run test:coverage` — отчёт покрытия
- `npm run lint` — ESLint + `tsc --noEmit`

## 12. Открытые риски и решения

| Риск | Решение |
|---|---|
| Ключ OpenWeather утечёт в бандле | Принимаем для MVP. OpenWeather бесплатный, лимиты защитят от злоупотреблений. В PRO-итерации — добавить минимальный backend-прокси. |
| OpenWeather закроет бесплатный тариф | Изолировано в `infrastructure/api/` — замена на Open-Meteo или другое API точечная. |
| Free tier 60 req/min — упираемся при большом числе избранных | TanStack Query дедуплицирует запросы + кеш. На дефолтных 1-5 городах проблемы не будет. |
| Weather code → иконка: разночтения между OpenWeather и тем, что мы хотим | Полная таблица в `weatherCodes.ts` с тестами на каждый код. |

## 13. Что НЕ делаем в MVP (PRO-фичи на будущее)

- График температуры (chart.js / recharts)
- Анимации погоды (дождь, снег)
- Уведомления «дождь через 2 часа»
- PWA и установка на телефон
- Переключение °C / °F
- Виджет для сторонних сайтов
- История поиска
- Расширенные метрики (качество воздуха, видимость, осадки мм/ч)
