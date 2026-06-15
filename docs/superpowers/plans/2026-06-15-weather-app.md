# Weather App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully working Weather App MVP — search cities, show current weather, 5-day forecast, geolocation, favorites, dark/light/auto theme, RU/EN i18n — via a layered React/TypeScript app backed by OpenWeather.

**Architecture:** Four-layer separation (presentation / application / infrastructure / domain) with one-way dependencies. Server data flows through TanStack Query; UI state and persisted preferences live in React Contexts + LocalStorage. Domain is pure types and mappers, no I/O.

**Tech Stack:** Vite 5, React 18, TypeScript (strict), Tailwind CSS, TanStack Query v5, OpenWeather REST API, Vitest, React Testing Library, MSW v2, ESLint.

**Reference spec:** `docs/superpowers/specs/2026-06-15-weather-app-design.md`

---

## Phase 1: Project Scaffolding

### Task 1: Initialize Vite + React + TypeScript project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `src/index.css`, `.gitignore`

- [ ] **Step 1: Verify Node and create Vite project**

Run in project root:
```bash
cd "E:/Git/Погодное приложение (Weather App)"
npm create vite@latest . -- --template react-ts
```
When prompted to confirm non-empty directory (only `docs/` and `.git` exist), type `y` and press Enter. If the prompt differs, choose "Ignore files and continue".

Expected: `package.json`, `vite.config.ts`, `tsconfig.json`, `src/` are created.

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev -- --port 5173 &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
kill %1 2>/dev/null
```
Expected: prints `200`.

- [ ] **Step 4: Set TypeScript to strict**

Edit `tsconfig.json` — ensure `"strict": true` is present in `compilerOptions`. Add missing strict-related flags:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": false,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript"
```

---

### Task 2: Add Tailwind CSS

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Install Tailwind**

```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 2: Configure Tailwind with dark-mode selector**

Replace `tailwind.config.ts` with:
```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 3: Replace `src/index.css` with Tailwind layers + theme variables**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root[data-theme='light'] {
  --bg: #f1f5f9;
  --surface: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --accent: #3b82f6;
}

:root[data-theme='dark'] {
  --bg: #0f172a;
  --surface: #1e293b;
  --text: #f1f5f9;
  --muted: #94a3b8;
  --accent: #60a5fa;
}

html, body, #root {
  height: 100%;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  transition: background-color 200ms ease, color 200ms ease;
}
```

- [ ] **Step 4: Verify Tailwind works**

Edit `src/App.tsx`:
```tsx
export default function App() {
  return <div className="p-8 text-2xl font-light">Hello Tailwind</div>;
}
```

Run `npm run dev`. Open browser to localhost:5173. Expected: large light-gray text on white background.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Tailwind CSS with theme variables"
```

---

### Task 3: Add runtime dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install TanStack Query**

```bash
npm install @tanstack/react-query@5
```

- [ ] **Step 2: Verify installation**

```bash
cat package.json | grep -E '"@tanstack'
```
Expected: a line with `"@tanstack/react-query": "^5.x.x"`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @tanstack/react-query"
```

---

### Task 4: Add test dependencies and configure Vitest

**Files:**
- Create: `vitest.config.ts`, `src/test/setup.ts`
- Modify: `package.json`

- [ ] **Step 1: Install testing tools**

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw@2
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
```

Install React plugin if not already present (it comes with Vite scaffold but verify):
```bash
npm list @vitejs/plugin-react
```
If missing: `npm install -D @vitejs/plugin-react`.

- [ ] **Step 3: Add test scripts to `package.json`**

Edit `package.json` — add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```
Install coverage if needed: `npm install -D @vitest/coverage-v8`.

- [ ] **Step 4: Create test setup file `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
});
```

- [ ] **Step 5: Add Vitest types to tsconfig**

Already covered via `types` field in Task 1.

- [ ] **Step 6: Write a sanity test `src/test/sanity.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 7: Run test**

```bash
npm test
```
Expected: 1 test passes.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: add Vitest + RTL + MSW dependencies and config"
```

---

### Task 5: Set up MSW for network mocking

**Files:**
- Create: `src/test/server.ts`, `src/test/handlers.ts`, `src/test/msw.d.ts`

- [ ] **Step 1: Initialize MSW service worker**

```bash
npx msw init public/ --save
```
Expected: `public/mockServiceWorker.js` is created. (For tests we use Node MSW, but this also primes public for browser dev later if needed.)

- [ ] **Step 2: Create `src/test/msw.d.ts`**

```ts
/// <reference types="msw" />
```

- [ ] **Step 3: Create empty handlers `src/test/handlers.ts`**

```ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('*/test', () => HttpResponse.json({ ok: true })),
];
```
(We add real handlers in later tasks.)

- [ ] **Step 4: Create `src/test/server.ts`**

```ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

- [ ] **Step 5: Wire server into setup**

Edit `src/test/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());
```

- [ ] **Step 6: Add test for MSW**

Append to `src/test/sanity.test.ts`:
```ts
import { server } from './server';
import { http, HttpResponse } from 'msw';

describe('msw', () => {
  it('intercepts requests', async () => {
    server.use(
      http.get('https://api.example.com/x', () => HttpResponse.json({ hi: 1 })),
    );
    const r = await fetch('https://api.example.com/x');
    const j = await r.json();
    expect(j).toEqual({ hi: 1 });
  });
});
```

- [ ] **Step 7: Run tests**

```bash
npm test
```
Expected: 2 tests pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "test: configure MSW for network mocking"
```

---

## Phase 2: Domain Layer (pure types and mappers)

### Task 6: Define domain types

**Files:**
- Create: `src/domain/types.ts`

- [ ] **Step 1: Write `src/domain/types.ts`**

```ts
export interface City {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export type WeatherCode =
  | 'clear'
  | 'partlyCloudy'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavyRain'
  | 'snow'
  | 'heavySnow'
  | 'sleet'
  | 'thunderstorm';

export interface Weather {
  temp: number;
  feelsLike: number;
  condition: WeatherCode;
  description: string;
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

export interface Forecast {
  daily: ForecastDay[];
  hourly: HourlyPoint[];
}

export type ApiError =
  | { kind: 'network' }
  | { kind: 'notFound' }
  | { kind: 'rateLimit' }
  | { kind: 'unauthorized' }
  | { kind: 'server'; status: number };
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/domain/types.ts
git commit -m "feat(domain): define core types"
```

---

### Task 7: weatherCodes mapping (TDD)

**Files:**
- Create: `src/domain/weatherCodes.ts`
- Test: `src/domain/weatherCodes.test.ts`

- [ ] **Step 1: Write failing test `src/domain/weatherCodes.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { mapWeatherCode } from './weatherCodes';

describe('mapWeatherCode', () => {
  it('maps clear sky (800) to clear', () => {
    expect(mapWeatherCode(800)).toBe('clear');
  });
  it('maps few clouds (801) to partlyCloudy', () => {
    expect(mapWeatherCode(801)).toBe('partlyCloudy');
  });
  it('maps scattered clouds (802) to cloudy', () => {
    expect(mapWeatherCode(802)).toBe('cloudy');
  });
  it('maps broken/overcast (803/804) to overcast', () => {
    expect(mapWeatherCode(803)).toBe('overcast');
    expect(mapWeatherCode(804)).toBe('overcast');
  });
  it('maps fog/mist/haze (701-781) to fog', () => {
    expect(mapWeatherCode(701)).toBe('fog');
    expect(mapWeatherCode(741)).toBe('fog');
    expect(mapWeatherCode(781)).toBe('fog');
  });
  it('maps drizzle (300-321) to drizzle', () => {
    expect(mapWeatherCode(300)).toBe('drizzle');
    expect(mapWeatherCode(321)).toBe('drizzle');
  });
  it('maps rain 500-509 to rain, 520+ to heavyRain', () => {
    expect(mapWeatherCode(500)).toBe('rain');
    expect(mapWeatherCode(501)).toBe('rain');
    expect(mapWeatherCode(502)).toBe('heavyRain');
    expect(mapWeatherCode(522)).toBe('heavyRain');
  });
  it('maps snow 600-609 to snow, 620+ to heavySnow', () => {
    expect(mapWeatherCode(600)).toBe('snow');
    expect(mapWeatherCode(601)).toBe('snow');
    expect(mapWeatherCode(602)).toBe('heavySnow');
    expect(mapWeatherCode(622)).toBe('heavySnow');
  });
  it('maps sleet 611 to sleet', () => {
    expect(mapWeatherCode(611)).toBe('sleet');
  });
  it('maps thunderstorm (200-232) to thunderstorm', () => {
    expect(mapWeatherCode(200)).toBe('thunderstorm');
    expect(mapWeatherCode(232)).toBe('thunderstorm');
  });
  it('falls back to cloudy for unknown codes', () => {
    expect(mapWeatherCode(999)).toBe('cloudy');
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- weatherCodes
```
Expected: FAIL with "Cannot find module './weatherCodes'".

- [ ] **Step 3: Implement `src/domain/weatherCodes.ts`**

```ts
import type { WeatherCode } from './types';

export function mapWeatherCode(owId: number): WeatherCode {
  if (owId === 800) return 'clear';
  if (owId === 801) return 'partlyCloudy';
  if (owId === 802) return 'cloudy';
  if (owId === 803 || owId === 804) return 'overcast';
  if (owId >= 700 && owId <= 781) return 'fog';
  if (owId >= 300 && owId <= 321) return 'drizzle';
  if (owId >= 520 && owId <= 531) return 'heavyRain';
  if (owId >= 500 && owId <= 504) return 'rain';
  if (owId >= 600 && owId <= 601) return 'snow';
  if (owId >= 602 && owId <= 622) return 'heavySnow';
  if (owId === 611 || owId === 612) return 'sleet';
  if (owId >= 200 && owId <= 232) return 'thunderstorm';
  return 'cloudy';
}

export const WEATHER_ICON: Record<WeatherCode, string> = {
  clear: '☀️',
  partlyCloudy: '⛅',
  cloudy: '☁️',
  overcast: '☁️',
  fog: '🌫️',
  drizzle: '💧',
  rain: '🌧️',
  heavyRain: '⛈️',
  snow: '🌨️',
  heavySnow: '❄️',
  sleet: '🌨️',
  thunderstorm: '⛈️',
};
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- weatherCodes
```
Expected: 11 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/domain/weatherCodes.ts src/domain/weatherCodes.test.ts
git commit -m "feat(domain): OpenWeather code mapping with table tests"
```

---

### Task 8: Russian pluralization (TDD)

**Files:**
- Create: `src/domain/plural.ts`
- Test: `src/domain/plural.test.ts`

- [ ] **Step 1: Write failing test `src/domain/plural.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { pluralRu } from './plural';

describe('pluralRu', () => {
  it('uses form [0] for numbers ending in 1 (except 11)', () => {
    expect(pluralRu(1, ['день', 'дня', 'дней'])).toBe('день');
    expect(pluralRu(21, ['день', 'дня', 'дней'])).toBe('день');
    expect(pluralRu(101, ['день', 'дня', 'дней'])).toBe('день');
  });
  it('uses form [1] for 2..4 (except 12..14)', () => {
    expect(pluralRu(2, ['день', 'дня', 'дней'])).toBe('дня');
    expect(pluralRu(3, ['день', 'дня', 'дней'])).toBe('дня');
    expect(pluralRu(4, ['день', 'дня', 'дней'])).toBe('дня');
    expect(pluralRu(22, ['день', 'дня', 'дней'])).toBe('дня');
  });
  it('uses form [2] for 0, 5..20, 25..30, 11..14', () => {
    expect(pluralRu(0, ['день', 'дня', 'дней'])).toBe('дней');
    expect(pluralRu(5, ['день', 'дня', 'дней'])).toBe('дней');
    expect(pluralRu(11, ['день', 'дня', 'дней'])).toBe('дней');
    expect(pluralRu(12, ['день', 'дня', 'дней'])).toBe('дней');
    expect(pluralRu(14, ['день', 'дня', 'дней'])).toBe('дней');
    expect(pluralRu(20, ['день', 'дня', 'дней'])).toBe('дней');
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- plural
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/domain/plural.ts`**

```ts
export function pluralRu(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const n1 = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- plural
```
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/domain/plural.ts src/domain/plural.test.ts
git commit -m "feat(domain): Russian pluralization helper"
```

---

### Task 9: OpenWeather response mappers (TDD)

**Files:**
- Create: `src/domain/mappers.ts`, `src/domain/mappers.test.ts`

- [ ] **Step 1: Write failing test `src/domain/mappers.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { mapCurrentWeather, mapForecast, mapCity } from './mappers';

const sampleCurrent = {
  main: { temp: 18.4, feels_like: 16.2, humidity: 62, pressure: 1008 },
  weather: [{ id: 802, main: 'Clouds', description: 'облачно с прояснениями' }],
  wind: { speed: 4, deg: 180 },
  dt: 1718450000,
  sys: { sunrise: 1718420000, sunset: 1718480000 },
};

const sampleForecast = {
  list: [
    { dt: 1718460000, main: { temp: 19, temp_min: 17, temp_max: 21 }, weather: [{ id: 800 }] },
    { dt: 1718470800, main: { temp: 18, temp_min: 16, temp_max: 20 }, weather: [{ id: 801 }] },
    { dt: 1718481600, main: { temp: 12, temp_min: 10, temp_max: 14 }, weather: [{ id: 500 }] },
    { dt: 1718550000, main: { temp: 20, temp_min: 18, temp_max: 22 }, weather: [{ id: 800 }] },
  ],
};

describe('mapCurrentWeather', () => {
  it('maps OW current response to Weather', () => {
    const w = mapCurrentWeather(sampleCurrent);
    expect(w.temp).toBe(18.4);
    expect(w.feelsLike).toBe(16.2);
    expect(w.condition).toBe('cloudy');
    expect(w.description).toBe('облачно с прояснениями');
    expect(w.humidity).toBe(62);
    expect(w.pressure).toBe(1008);
    expect(w.windSpeed).toBe(4);
    expect(w.windDeg).toBe(180);
    expect(w.observedAt).toBeInstanceOf(Date);
    expect(w.sunrise).toBeInstanceOf(Date);
    expect(w.sunset).toBeInstanceOf(Date);
  });
  it('exposes uvIndex as 0 when API did not return it (free tier)', () => {
    const w = mapCurrentWeather(sampleCurrent);
    expect(w.uvIndex).toBe(0);
  });
});

describe('mapForecast', () => {
  it('groups 3h blocks into daily with min/max and noon icon', () => {
    const f = mapForecast(sampleForecast);
    expect(f.daily.length).toBeGreaterThanOrEqual(2);
    const first = f.daily[0]!;
    expect(first.min).toBeLessThanOrEqual(first.max);
    expect(typeof first.condition).toBe('string');
  });
  it('produces hourly points from the 3h blocks', () => {
    const f = mapForecast(sampleForecast);
    expect(f.hourly.length).toBe(4);
    expect(f.hourly[0]!.time).toBeInstanceOf(Date);
  });
});

describe('mapCity', () => {
  it('builds a stable id and copies fields', () => {
    const c = mapCity({ name: 'Moscow', country: 'RU', lat: 55.75, lon: 37.62 });
    expect(c.id).toBe('Moscow,RU,55.75,37.62');
    expect(c.name).toBe('Moscow');
    expect(c.country).toBe('RU');
    expect(c.lat).toBe(55.75);
    expect(c.lon).toBe(37.62);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- mappers
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/domain/mappers.ts`**

```ts
import type { City, Forecast, ForecastDay, HourlyPoint, Weather, WeatherCode } from './types';
import { mapWeatherCode } from './weatherCodes';

interface OwWeatherRaw {
  id: number;
  main: string;
  description: string;
}

interface OwCurrentRaw {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: OwWeatherRaw[];
  wind: { speed: number; deg: number };
  dt: number;
  sys: { sunrise: number; sunset: number };
}

interface OwForecastItem {
  dt: number;
  main: { temp: number; temp_min: number; temp_max: number };
  weather: OwWeatherRaw[];
}

interface OwForecastRaw {
  list: OwForecastItem[];
}

interface OwGeoRaw {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

function pickIcon(items: OwForecastItem[]): WeatherCode {
  const noon = items.reduce((acc, cur) => {
    const accH = new Date(acc.dt * 1000).getHours();
    const curH = new Date(cur.dt * 1000).getHours();
    return Math.abs(curH - 12) < Math.abs(accH - 12) ? cur : acc;
  });
  return mapWeatherCode(noon.weather[0]!.id);
}

function pickDescription(items: OwForecastItem[]): string {
  return items[0]!.weather[0]!.description;
}

export function mapCurrentWeather(raw: OwCurrentRaw): Weather {
  const w = raw.weather[0]!;
  return {
    temp: raw.main.temp,
    feelsLike: raw.main.feels_like,
    condition: mapWeatherCode(w.id),
    description: w.description,
    humidity: raw.main.humidity,
    pressure: raw.main.pressure,
    windSpeed: raw.wind.speed,
    windDeg: raw.wind.deg,
    uvIndex: 0, // not provided by /data/2.5/weather free tier
    observedAt: new Date(raw.dt * 1000),
    sunrise: new Date(raw.sys.sunrise * 1000),
    sunset: new Date(raw.sys.sunset * 1000),
  };
}

export function mapForecast(raw: OwForecastRaw): Forecast {
  const hourly: HourlyPoint[] = raw.list.map((it) => ({
    time: new Date(it.dt * 1000),
    temp: it.main.temp,
    condition: mapWeatherCode(it.weather[0]!.id),
  }));

  const byDay = new Map<string, OwForecastItem[]>();
  for (const it of raw.list) {
    const key = new Date(it.dt * 1000).toISOString().slice(0, 10);
    const arr = byDay.get(key) ?? [];
    arr.push(it);
    byDay.set(key, arr);
  }

  const daily: ForecastDay[] = [...byDay.entries()].map(([key, items]) => {
    const min = Math.min(...items.map((i) => i.main.temp_min));
    const max = Math.max(...items.map((i) => i.main.temp_max));
    return {
      date: new Date(`${key}T00:00:00`),
      min,
      max,
      condition: pickIcon(items),
      description: pickDescription(items),
    };
  });

  daily.sort((a, b) => a.date.getTime() - b.date.getTime());

  return { daily, hourly };
}

export function mapCity(raw: OwGeoRaw): City {
  return {
    id: `${raw.name},${raw.country},${raw.lat.toFixed(2)},${raw.lon.toFixed(2)}`,
    name: raw.name,
    country: raw.country,
    lat: raw.lat,
    lon: raw.lon,
  };
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- mappers
```
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/domain/mappers.ts src/domain/mappers.test.ts
git commit -m "feat(domain): OpenWeather response mappers"
```

---

## Phase 3: Infrastructure Layer

### Task 10: Config & env reader

**Files:**
- Create: `src/config/env.ts`, `src/vite-env.d.ts` (modify), `.env.example`

- [ ] **Step 1: Create `.env.example`**

```bash
# Copy to .env and fill in your OpenWeather API key
# Get a free key at https://openweathermap.org/api
VITE_OPENWEATHER_API_KEY=
```

- [ ] **Step 2: Create `src/config/env.ts`**

```ts
const API_KEY = (import.meta.env.VITE_OPENWEATHER_API_KEY ?? '').trim();

export const env = {
  apiKey: API_KEY,
  baseUrl: 'https://api.openweathermap.org',
  get configured(): boolean {
    return API_KEY.length > 0;
  },
};
```

- [ ] **Step 3: Add `src/vite-env.d.ts` types**

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENWEATHER_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(config): env reader for OpenWeather API key"
```

---

### Task 11: localStorage wrapper (TDD)

**Files:**
- Create: `src/infrastructure/storage/localStorage.ts`
- Test: `src/infrastructure/storage/localStorage.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/infrastructure/storage/localStorage.test.ts
import { describe, it, expect } from 'vitest';
import { readStorage, writeStorage, removeStorage } from './localStorage';

describe('localStorage wrapper', () => {
  it('returns null when nothing is stored', () => {
    expect(readStorage<string>('k')).toBeNull();
  });
  it('round-trips a string', () => {
    writeStorage('k', 'hello');
    expect(readStorage<string>('k')).toBe('hello');
  });
  it('round-trips an object as JSON', () => {
    writeStorage('obj', { a: 1, b: ['x'] });
    expect(readStorage<{ a: number; b: string[] }>('obj')).toEqual({ a: 1, b: ['x'] });
  });
  it('returns null and clears on corrupt JSON', () => {
    localStorage.setItem('bad', '{not json');
    expect(readStorage('bad')).toBeNull();
    expect(localStorage.getItem('bad')).toBeNull();
  });
  it('removes a key', () => {
    writeStorage('k', 'v');
    removeStorage('k');
    expect(readStorage('k')).toBeNull();
  });
  it('survives localStorage throwing (private mode)', () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => { throw new Error('denied'); };
    try {
      expect(readStorage('any')).toBeNull();
    } finally {
      Storage.prototype.getItem = original;
    }
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- localStorage
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/infrastructure/storage/localStorage.ts`**

```ts
export function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    return null;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — silently drop */
  }
}

export function removeStorage(key: string): void {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- localStorage
```
Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/infrastructure/storage/
git commit -m "feat(storage): typed localStorage wrapper with error handling"
```

---

### Task 12: httpClient (TDD)

**Files:**
- Create: `src/infrastructure/api/httpClient.ts`, `src/infrastructure/api/httpClient.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/infrastructure/api/httpClient.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/server';
import { httpClient } from './httpClient';

describe('httpClient.get', () => {
  it('returns parsed JSON on 200', async () => {
    server.use(
      http.get('https://api.test/x', () => HttpResponse.json({ ok: true })),
    );
    const data = await httpClient.get<{ ok: boolean }>('https://api.test/x');
    expect(data).toEqual({ ok: true });
  });

  it('throws notFound on 404', async () => {
    server.use(
      http.get('https://api.test/missing', () => HttpResponse.json({}, { status: 404 })),
    );
    await expect(httpClient.get('https://api.test/missing')).rejects.toMatchObject({ kind: 'notFound' });
  });

  it('throws unauthorized on 401', async () => {
    server.use(
      http.get('https://api.test/no', () => HttpResponse.json({}, { status: 401 })),
    );
    await expect(httpClient.get('https://api.test/no')).rejects.toMatchObject({ kind: 'unauthorized' });
  });

  it('throws rateLimit on 429', async () => {
    server.use(
      http.get('https://api.test/limit', () => HttpResponse.json({}, { status: 429 })),
    );
    await expect(httpClient.get('https://api.test/limit')).rejects.toMatchObject({ kind: 'rateLimit' });
  });

  it('throws server on 500', async () => {
    server.use(
      http.get('https://api.test/boom', () => HttpResponse.json({}, { status: 500 })),
    );
    await expect(httpClient.get('https://api.test/boom')).rejects.toMatchObject({ kind: 'server', status: 500 });
  });

  it('throws network on fetch failure', async () => {
    server.use(
      http.get('https://api.test/down', () => HttpResponse.error()),
    );
    await expect(httpClient.get('https://api.test/down')).rejects.toMatchObject({ kind: 'network' });
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- httpClient
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/infrastructure/api/httpClient.ts`**

```ts
import type { ApiError } from '../../domain/types';

export class ApiRequestError extends Error {
  constructor(public info: ApiError) {
    super(info.kind);
    this.name = 'ApiRequestError';
  }
}

function toError(status: number): ApiError {
  if (status === 404) return { kind: 'notFound' };
  if (status === 401) return { kind: 'unauthorized' };
  if (status === 429) return { kind: 'rateLimit' };
  return { kind: 'server', status };
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) throw new ApiRequestError(toError(res.status));
  return (await res.json()) as T;
}

export const httpClient = {
  async get<T>(url: string, signal?: AbortSignal): Promise<T> {
    try {
      const res = await fetch(url, { signal });
      return await parseResponse<T>(res);
    } catch (e) {
      if (e instanceof ApiRequestError) throw e;
      throw new ApiRequestError({ kind: 'network' });
    }
  },
};
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- httpClient
```
Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/infrastructure/api/httpClient.ts src/infrastructure/api/httpClient.test.ts
git commit -m "feat(api): httpClient with normalized error types"
```

---

### Task 13: weatherService and geocodingService (TDD)

**Files:**
- Create: `src/infrastructure/api/weatherService.ts`, `src/infrastructure/api/weatherService.test.ts`, `src/infrastructure/api/geocodingService.ts`, `src/infrastructure/api/geocodingService.test.ts`

- [ ] **Step 1: Write failing test for weatherService**

```ts
// src/infrastructure/api/weatherService.test.ts
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/server';
import { weatherService } from './weatherService';
import { env } from '../../config/env';

describe('weatherService', () => {
  it('getCurrent hits /data/2.5/weather with units=metric and lang', async () => {
    let url = '';
    server.use(
      http.get(`${env.baseUrl}/data/2.5/weather`, ({ request }) => {
        url = request.url;
        return HttpResponse.json({
          main: { temp: 10, feels_like: 9, humidity: 50, pressure: 1010 },
          weather: [{ id: 800, main: 'Clear', description: 'clear' }],
          wind: { speed: 1, deg: 90 },
          dt: 1718450000,
          sys: { sunrise: 1718420000, sunset: 1718480000 },
        });
      }),
    );
    await weatherService.getCurrent({ lat: 55.75, lon: 37.62, lang: 'en' });
    expect(url).toContain('lat=55.75');
    expect(url).toContain('lon=37.62');
    expect(url).toContain('units=metric');
    expect(url).toContain('lang=en');
    expect(url).toContain(`appid=${env.apiKey}`);
  });

  it('getForecast hits /data/2.5/forecast', async () => {
    let url = '';
    server.use(
      http.get(`${env.baseUrl}/data/2.5/forecast`, ({ request }) => {
        url = request.url;
        return HttpResponse.json({ list: [] });
      }),
    );
    await weatherService.getForecast({ lat: 55.75, lon: 37.62, lang: 'ru' });
    expect(url).toContain('/data/2.5/forecast');
    expect(url).toContain('lang=ru');
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- weatherService
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/infrastructure/api/weatherService.ts`**

```ts
import { httpClient } from './httpClient';
import { env } from '../../config/env';
import { mapCurrentWeather, mapForecast } from '../../domain/mappers';
import type { Forecast, Weather } from '../../domain/types';

interface Coords {
  lat: number;
  lon: number;
  lang: 'ru' | 'en';
}

function buildUrl(path: string, coords: Coords): string {
  const u = new URL(`${env.baseUrl}${path}`);
  u.searchParams.set('lat', String(coords.lat));
  u.searchParams.set('lon', String(coords.lon));
  u.searchParams.set('units', 'metric');
  u.searchParams.set('lang', coords.lang);
  u.searchParams.set('appid', env.apiKey);
  return u.toString();
}

export const weatherService = {
  async getCurrent(coords: Coords): Promise<Weather> {
    const raw = await httpClient.get<Parameters<typeof mapCurrentWeather>[0]>(
      buildUrl('/data/2.5/weather', coords),
    );
    return mapCurrentWeather(raw);
  },
  async getForecast(coords: Coords): Promise<Forecast> {
    const raw = await httpClient.get<Parameters<typeof mapForecast>[0]>(
      buildUrl('/data/2.5/forecast', coords),
    );
    return mapForecast(raw);
  },
};
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- weatherService
```
Expected: 2 tests pass.

- [ ] **Step 5: Write failing test for geocodingService**

```ts
// src/infrastructure/api/geocodingService.test.ts
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/server';
import { env } from '../../config/env';
import { geocodingService } from './geocodingService';

describe('geocodingService', () => {
  it('search uses /geo/1.0/direct with limit and lang', async () => {
    let url = '';
    server.use(
      http.get(`${env.baseUrl}/geo/1.0/direct`, ({ request }) => {
        url = request.url;
        return HttpResponse.json([
          { name: 'Moscow', country: 'RU', lat: 55.75, lon: 37.62 },
        ]);
      }),
    );
    const cities = await geocodingService.search({ query: 'Moscow', lang: 'en' });
    expect(cities).toHaveLength(1);
    expect(cities[0]!.name).toBe('Moscow');
    expect(url).toContain('q=Moscow');
    expect(url).toContain('limit=5');
    expect(url).toContain('lang=en');
  });

  it('reverse uses /geo/1.0/reverse with limit=1', async () => {
    let url = '';
    server.use(
      http.get(`${env.baseUrl}/geo/1.0/reverse`, ({ request }) => {
        url = request.url;
        return HttpResponse.json([{ name: 'X', country: 'Y', lat: 0, lon: 0 }]);
      }),
    );
    await geocodingService.reverse({ lat: 0, lon: 0 });
    expect(url).toContain('lat=0');
    expect(url).toContain('lon=0');
    expect(url).toContain('limit=1');
  });
});
```

- [ ] **Step 6: Run test — expect failure**

```bash
npm test -- geocodingService
```
Expected: FAIL.

- [ ] **Step 7: Implement `src/infrastructure/api/geocodingService.ts`**

```ts
import { httpClient } from './httpClient';
import { env } from '../../config/env';
import { mapCity } from '../../domain/mappers';
import type { City } from '../../domain/types';

interface RawGeo {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export const geocodingService = {
  async search({ query, lang }: { query: string; lang: 'ru' | 'en' }): Promise<City[]> {
    const u = new URL(`${env.baseUrl}/geo/1.0/direct`);
    u.searchParams.set('q', query);
    u.searchParams.set('limit', '5');
    u.searchParams.set('lang', lang);
    u.searchParams.set('appid', env.apiKey);
    const raw = await httpClient.get<RawGeo[]>(u.toString());
    return raw.map(mapCity);
  },
  async reverse({ lat, lon }: { lat: number; lon: number }): Promise<City | null> {
    const u = new URL(`${env.baseUrl}/geo/1.0/reverse`);
    u.searchParams.set('lat', String(lat));
    u.searchParams.set('lon', String(lon));
    u.searchParams.set('limit', '1');
    u.searchParams.set('appid', env.apiKey);
    const raw = await httpClient.get<RawGeo[]>(u.toString());
    return raw[0] ? mapCity(raw[0]) : null;
  },
};
```

- [ ] **Step 8: Run test — expect pass**

```bash
npm test -- geocodingService
```
Expected: 2 tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/infrastructure/api/
git commit -m "feat(api): weatherService and geocodingService"
```

---

## Phase 4: Application Layer (i18n, contexts, hooks)

### Task 14: i18n dictionaries and useTranslation (TDD)

**Files:**
- Create: `src/application/i18n/ru.ts`, `src/application/i18n/en.ts`, `src/application/i18n/useTranslation.tsx`, `src/application/i18n/useTranslation.test.tsx`

- [ ] **Step 1: Create `src/application/i18n/ru.ts`**

```ts
import { pluralRu } from '../../domain/plural';

const ru = {
  app: { title: 'Погода' },
  search: { placeholder: 'Введите город…', noResults: 'Город не найден' },
  geolocation: { button: 'Погода рядом', denied: 'Доступ к геолокации запрещён', unavailable: 'Геолокация недоступна' },
  favorites: { add: 'В избранное', remove: 'Убрать из избранного', empty: 'Нет избранных городов' },
  weather: {
    feelsLike: 'Ощущается {temp}°',
    humidity: 'Влажность',
    pressure: 'Давление',
    wind: 'Ветер',
    uv: 'UV-индекс',
    forecastDays: (n: number) => `Прогноз на ${n} ${pluralRu(n, ['день', 'дня', 'дней'])}`,
    hourly: 'Почасовой прогноз',
    updated: 'Обновлено {time}',
  },
  errors: {
    network: 'Нет интернета. Проверьте подключение.',
    notFound: 'Город не найден',
    rateLimit: 'Превышен лимит запросов. Попробуйте позже.',
    unauthorized: 'API-ключ не настроен или неверный',
    server: 'Ошибка сервера ({status}). Попробуйте позже.',
    apiKeyMissing: 'Добавьте VITE_OPENWEATHER_API_KEY в .env',
  },
  units: { mmHg: 'мм рт.ст.', ms: 'м/с' },
  weekdays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  weekdaysFull: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  theme: { label: 'Тема', light: 'Светлая', dark: 'Тёмная', auto: 'Авто' },
  language: { label: 'Язык', ru: 'Русский', en: 'English' },
  conditions: {
    clear: 'ясно',
    partlyCloudy: 'переменная облачность',
    cloudy: 'облачно',
    overcast: 'пасмурно',
    fog: 'туман',
    drizzle: 'морось',
    rain: 'дождь',
    heavyRain: 'сильный дождь',
    snow: 'снег',
    heavySnow: 'сильный снег',
    sleet: 'дождь со снегом',
    thunderstorm: 'гроза',
  },
};
export default ru;
export type Dictionary = typeof ru;
```

- [ ] **Step 2: Create `src/application/i18n/en.ts`**

```ts
import ru from './ru';

const en: ru.Dictionary = {
  app: { title: 'Weather' },
  search: { placeholder: 'Search city…', noResults: 'City not found' },
  geolocation: { button: 'Weather nearby', denied: 'Geolocation denied', unavailable: 'Geolocation unavailable' },
  favorites: { add: 'Add to favorites', remove: 'Remove from favorites', empty: 'No favorite cities' },
  weather: {
    ...ru.weather,
    feelsLike: 'Feels like {temp}°',
    updated: 'Updated {time}',
  },
  errors: {
    network: 'No internet. Check your connection.',
    notFound: 'City not found',
    rateLimit: 'Rate limit exceeded. Try later.',
    unauthorized: 'API key missing or invalid',
    server: 'Server error ({status}). Try later.',
    apiKeyMissing: 'Add VITE_OPENWEATHER_API_KEY to .env',
  },
  units: { mmHg: 'mmHg', ms: 'm/s' },
  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  weekdaysFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  theme: { label: 'Theme', light: 'Light', dark: 'Dark', auto: 'Auto' },
  language: { label: 'Language', ru: 'Russian', en: 'English' },
  conditions: {
    clear: 'clear',
    partlyCloudy: 'partly cloudy',
    cloudy: 'cloudy',
    overcast: 'overcast',
    fog: 'fog',
    drizzle: 'drizzle',
    rain: 'rain',
    heavyRain: 'heavy rain',
    snow: 'snow',
    heavySnow: 'heavy snow',
    sleet: 'sleet',
    thunderstorm: 'thunderstorm',
  },
};
export default en;
```

- [ ] **Step 3: Create `src/application/i18n/useTranslation.tsx`**

```tsx
import { createContext, useCallback, useContext, type ReactNode } from 'react';
import ru from './ru';
import en from './en';

export type Language = 'ru' | 'en';

const dictionaries = { ru, en };

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function get(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`));
}

export function I18nProvider({
  lang,
  setLang,
  children,
}: {
  lang: Language;
  setLang: (lang: Language) => void;
  children: ReactNode;
}) {
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = dictionaries[lang];
      const value = get(dict, key);
      if (typeof value === 'string') return interpolate(value, vars);
      if (typeof value === 'function') {
        return (value as (n: number) => string)(Number(vars?.n ?? 0));
      }
      return key;
    },
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
}
```

- [ ] **Step 4: Write test `src/application/i18n/useTranslation.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider, useTranslation } from './useTranslation';

function Probe({ k, v }: { k: string; v?: Record<string, string | number> }) {
  const { t } = useTranslation();
  return <span>{t(k, v)}</span>;
}

describe('useTranslation', () => {
  it('translates a known key in RU', () => {
    render(<I18nProvider lang="ru" setLang={() => {}}><Probe k="search.placeholder" /></I18nProvider>);
    expect(screen.getByText('Введите город…')).toBeInTheDocument();
  });
  it('translates a known key in EN', () => {
    render(<I18nProvider lang="en" setLang={() => {}}><Probe k="search.placeholder" /></I18nProvider>);
    expect(screen.getByText('Search city…')).toBeInTheDocument();
  });
  it('interpolates variables', () => {
    render(<I18nProvider lang="en" setLang={() => {}}><Probe k="weather.feelsLike" v={{ temp: 5 }} /></I18nProvider>);
    expect(screen.getByText('Feels like 5°')).toBeInTheDocument();
  });
  it('returns the key for unknown paths', () => {
    render(<I18nProvider lang="en" setLang={() => {}}><Probe k="does.not.exist" /></I18nProvider>);
    expect(screen.getByText('does.not.exist')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run test — expect pass**

```bash
npm test -- useTranslation
```
Expected: 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/application/i18n/
git commit -m "feat(i18n): RU/EN dictionaries and useTranslation hook"
```

---

### Task 15: LanguageContext with localStorage

**Files:**
- Create: `src/application/context/LanguageContext.tsx`, `src/application/context/LanguageContext.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/application/context/LanguageContext.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageContext';

function Probe() {
  const { lang, setLang } = useLanguage();
  return (
    <>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang('en')}>to-en</button>
      <button onClick={() => setLang('ru')}>to-ru</button>
    </>
  );
}

describe('LanguageContext', () => {
  it('defaults to en when navigator is en', () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId('lang').textContent).toBe('en');
  });

  it('setLang persists to localStorage', () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    fireEvent.click(screen.getByText('to-ru'));
    expect(screen.getByTestId('lang').textContent).toBe('ru');
    expect(localStorage.getItem('weather-app:lang:v1')).toBe(JSON.stringify({ lang: 'ru' }));
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- LanguageContext
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/application/context/LanguageContext.tsx`**

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readStorage, writeStorage } from '../../infrastructure/storage/localStorage';
import { I18nProvider, type Language } from '../i18n/useTranslation';

const STORAGE_KEY = 'weather-app:lang:v1';

function detectInitial(): Language {
  const stored = readStorage<{ lang: Language }>(STORAGE_KEY);
  if (stored?.lang === 'ru' || stored?.lang === 'en') return stored.lang;
  const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en';
  return nav.startsWith('ru') ? 'ru' : 'en';
}

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => detectInitial());

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    writeStorage(STORAGE_KEY, { lang: next });
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return (
    <LanguageContext.Provider value={value}>
      <I18nProvider lang={lang} setLang={setLang}>{children}</I18nProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- LanguageContext
```
Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/application/context/LanguageContext.tsx src/application/context/LanguageContext.test.tsx
git commit -m "feat(context): LanguageContext with localStorage persistence"
```

---

### Task 16: ThemeContext

**Files:**
- Create: `src/application/context/ThemeContext.tsx`, `src/application/context/ThemeContext.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/application/context/ThemeContext.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

function Probe() {
  const { theme, setTheme, resolved } = useTheme();
  return (
    <>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolved}</span>
      <button onClick={() => setTheme('dark')}>dark</button>
      <button onClick={() => setTheme('light')}>light</button>
      <button onClick={() => setTheme('auto')}>auto</button>
    </>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('applies data-theme to <html> on change', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    fireEvent.click(screen.getByText('dark'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    fireEvent.click(screen.getByText('light'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('persists choice to localStorage', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    fireEvent.click(screen.getByText('dark'));
    expect(localStorage.getItem('weather-app:theme:v1')).toBe(JSON.stringify({ theme: 'dark' }));
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- ThemeContext
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/application/context/ThemeContext.tsx`**

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readStorage, writeStorage } from '../../infrastructure/storage/localStorage';

export type Theme = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'weather-app:theme:v1';

function detectInitial(): Theme {
  const stored = readStorage<{ theme: Theme }>(STORAGE_KEY);
  if (stored?.theme === 'light' || stored?.theme === 'dark' || stored?.theme === 'auto') {
    return stored.theme;
  }
  return 'auto';
}

function resolveTheme(theme: Theme, systemDark: boolean): ResolvedTheme {
  if (theme === 'auto') return systemDark ? 'dark' : 'light';
  return theme;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => detectInitial());
  const [systemDark, setSystemDark] = useState<boolean>(() => getSystemDark());

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const resolved = resolveTheme(theme, systemDark);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    writeStorage(STORAGE_KEY, { theme: next });
  }, []);

  const value = useMemo(() => ({ theme, setTheme, resolved }), [theme, setTheme, resolved]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- ThemeContext
```
Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/application/context/ThemeContext.tsx src/application/context/ThemeContext.test.tsx
git commit -m "feat(context): ThemeContext with light/dark/auto"
```

---

### Task 17: FavoritesContext

**Files:**
- Create: `src/application/context/FavoritesContext.tsx`, `src/application/context/FavoritesContext.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/application/context/FavoritesContext.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FavoritesProvider, useFavorites } from './FavoritesContext';

const moscow = { id: 'Moscow,RU,55.75,37.62', name: 'Moscow', country: 'RU', lat: 55.75, lon: 37.62 };
const london = { id: 'London,GB,51.51,-0.13', name: 'London', country: 'GB', lat: 51.51, lon: -0.13 };

function Probe() {
  const f = useFavorites();
  return (
    <>
      <span data-testid="cities">{f.cities.length}</span>
      <span data-testid="selected">{f.selectedId ?? 'none'}</span>
      <button onClick={() => f.add(moscow)}>add-m</button>
      <button onClick={() => f.add(london)}>add-l</button>
      <button onClick={() => f.select(moscow.id)}>sel-m</button>
      <button onClick={() => f.remove(london.id)}>rem-l</button>
    </>
  );
}

describe('FavoritesContext', () => {
  it('seeds with Moscow when nothing is stored', () => {
    render(<FavoritesProvider><Probe /></FavoritesProvider>);
    expect(screen.getByTestId('cities').textContent).toBe('1');
    expect(screen.getByTestId('selected').textContent).toBe(moscow.id);
  });

  it('add and select work, persist to localStorage', () => {
    render(<FavoritesProvider><Probe /></FavoritesProvider>);
    fireEvent.click(screen.getByText('add-l'));
    fireEvent.click(screen.getByText('sel-m'));
    expect(screen.getByTestId('cities').textContent).toBe('2');
    const stored = JSON.parse(localStorage.getItem('weather-app:favorites:v1')!);
    expect(stored.cities).toContainEqual(moscow);
    expect(stored.cities).toContainEqual(london);
    expect(stored.selectedId).toBe(moscow.id);
  });

  it('remove deletes city from list', () => {
    render(<FavoritesProvider><Probe /></FavoritesProvider>);
    fireEvent.click(screen.getByText('add-l'));
    fireEvent.click(screen.getByText('rem-l'));
    expect(screen.getByTestId('cities').textContent).toBe('1');
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- FavoritesContext
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/application/context/FavoritesContext.tsx`**

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { City } from '../../domain/types';
import { readStorage, writeStorage } from '../../infrastructure/storage/localStorage';

const STORAGE_KEY = 'weather-app:favorites:v1';
const DEFAULT_CITY: City = {
  id: 'Moscow,RU,55.75,37.62',
  name: 'Moscow',
  country: 'RU',
  lat: 55.75,
  lon: 37.62,
};

interface Stored {
  cities: City[];
  selectedId: string | null;
}

function loadInitial(): Stored {
  const stored = readStorage<Stored>(STORAGE_KEY);
  if (stored && Array.isArray(stored.cities)) return stored;
  return { cities: [DEFAULT_CITY], selectedId: DEFAULT_CITY.id };
}

interface FavoritesContextValue {
  cities: City[];
  selectedId: string | null;
  selectedCity: City | null;
  add: (city: City) => void;
  remove: (id: string) => void;
  select: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored>(() => loadInitial());

  useEffect(() => {
    writeStorage(STORAGE_KEY, state);
  }, [state]);

  const add = useCallback((city: City) => {
    setState((s) => {
      if (s.cities.some((c) => c.id === city.id)) return s;
      return { ...s, cities: [...s.cities, city] };
    });
  }, []);

  const remove = useCallback((id: string) => {
    setState((s) => {
      const cities = s.cities.filter((c) => c.id !== id);
      const selectedId = s.selectedId === id ? (cities[0]?.id ?? null) : s.selectedId;
      return { cities, selectedId };
    });
  }, []);

  const select = useCallback((id: string) => {
    setState((s) => (s.selectedId === id ? s : { ...s, selectedId: id }));
  }, []);

  const isFavorite = useCallback(
    (id: string) => state.cities.some((c) => c.id === id),
    [state.cities],
  );

  const value = useMemo<FavoritesContextValue>(() => {
    const selectedCity = state.cities.find((c) => c.id === state.selectedId) ?? null;
    return {
      cities: state.cities,
      selectedId: state.selectedId,
      selectedCity,
      add,
      remove,
      select,
      isFavorite,
    };
  }, [state, add, remove, select, isFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- FavoritesContext
```
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/application/context/FavoritesContext.tsx src/application/context/FavoritesContext.test.tsx
git commit -m "feat(context): FavoritesContext with persistence and Moscow default"
```

---

### Task 18: useDebounce and useGeolocation

**Files:**
- Create: `src/presentation/hooks/useDebounce.ts`, `src/presentation/hooks/useDebounce.test.ts`, `src/presentation/hooks/useGeolocation.ts`, `src/presentation/hooks/useGeolocation.test.ts`

- [ ] **Step 1: Write failing test for useDebounce**

```ts
// src/presentation/hooks/useDebounce.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('a', 200));
    expect(result.current).toBe('a');
  });

  it('updates after the delay', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 200), { initialProps: { v: 'a' } });
    rerender({ v: 'b' });
    expect(result.current).toBe('a');
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('b');
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- useDebounce
```

- [ ] **Step 3: Implement `src/presentation/hooks/useDebounce.ts`**

```ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test -- useDebounce
```

- [ ] **Step 5: Write failing test for useGeolocation**

```ts
// src/presentation/hooks/useGeolocation.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from './useGeolocation';

const mockGet = vi.fn();

beforeEach(() => {
  mockGet.mockReset();
  (globalThis as unknown as { navigator: { geolocation: { getCurrentPosition: typeof mockGet } } }).navigator = {
    geolocation: { getCurrentPosition: mockGet },
  };
});

describe('useGeolocation', () => {
  it('starts idle', () => {
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.status).toBe('idle');
  });

  it('resolves with coords on success', () => {
    mockGet.mockImplementation((success: PositionCallback) => {
      success({ coords: { latitude: 1, longitude: 2 } } as GeolocationPosition);
    });
    const { result } = renderHook(() => useGeolocation());
    act(() => { result.current.request(); });
    expect(result.current.status).toBe('success');
    expect(result.current.coords).toEqual({ lat: 1, lon: 2 });
  });

  it('captures denied state', () => {
    mockGet.mockImplementation((_s: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 1, message: 'denied' } as GeolocationPositionError);
    });
    const { result } = renderHook(() => useGeolocation());
    act(() => { result.current.request(); });
    expect(result.current.status).toBe('denied');
  });
});
```

- [ ] **Step 6: Run — expect failure**

```bash
npm test -- useGeolocation
```

- [ ] **Step 7: Implement `src/presentation/hooks/useGeolocation.ts`**

```ts
import { useCallback, useState } from 'react';

export type GeoStatus = 'idle' | 'requesting' | 'success' | 'denied' | 'unavailable';

export interface GeoCoords { lat: number; lon: number; }

export interface GeoState {
  status: GeoStatus;
  coords: GeoCoords | null;
  request: () => void;
}

export function useGeolocation(): GeoState {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [coords, setCoords] = useState<GeoCoords | null>(null);

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      return;
    }
    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setStatus('success');
      },
      (err) => {
        setStatus(err.code === 1 ? 'denied' : 'unavailable');
      },
      { timeout: 10_000 },
    );
  }, []);

  return { status, coords, request };
}
```

- [ ] **Step 8: Run — expect pass**

```bash
npm test -- useGeolocation
```

- [ ] **Step 9: Commit**

```bash
git add src/presentation/hooks/
git commit -m "feat(hooks): useDebounce and useGeolocation"
```

---

### Task 19: useWeather hook (TDD with MSW)

**Files:**
- Create: `src/application/hooks/useWeather.ts`, `src/application/hooks/useWeather.test.tsx`, `src/test/utils.tsx`

- [ ] **Step 1: Create test wrapper `src/test/utils.tsx`**

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
```

- [ ] **Step 2: Write failing test**

```tsx
// src/application/hooks/useWeather.test.tsx
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/server';
import { makeWrapper } from '../../test/utils';
import { useWeather } from './useWeather';
import { env } from '../../config/env';

const city = { id: 'M', name: 'M', country: 'R', lat: 55, lon: 37 };

describe('useWeather', () => {
  it('returns null data when cityId is null', () => {
    const { result } = renderHook(() => useWeather(null, 'en'), { wrapper: makeWrapper() });
    expect(result.current.current).toBeNull();
    expect(result.current.forecast).toBeNull();
  });

  it('fetches and maps current + forecast', async () => {
    server.use(
      http.get(`${env.baseUrl}/data/2.5/weather`, () => HttpResponse.json({
        main: { temp: 10, feels_like: 8, humidity: 50, pressure: 1000 },
        weather: [{ id: 800, main: 'Clear', description: 'clear' }],
        wind: { speed: 1, deg: 0 },
        dt: 1718450000, sys: { sunrise: 1718420000, sunset: 1718480000 },
      })),
      http.get(`${env.baseUrl}/data/2.5/forecast`, () => HttpResponse.json({
        list: [
          { dt: 1718460000, main: { temp: 11, temp_min: 9, temp_max: 12 }, weather: [{ id: 800 }] },
          { dt: 1718470800, main: { temp: 9, temp_min: 7, temp_max: 10 }, weather: [{ id: 800 }] },
        ],
      })),
    );
    const { result } = renderHook(() => useWeather(city, 'en'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.current?.temp).toBe(10));
    expect(result.current.forecast?.daily.length).toBeGreaterThan(0);
  });

  it('exposes ApiError on failure', async () => {
    server.use(
      http.get(`${env.baseUrl}/data/2.5/weather`, () => HttpResponse.json({}, { status: 401 })),
      http.get(`${env.baseUrl}/data/2.5/forecast`, () => HttpResponse.json({ list: [] })),
    );
    const { result } = renderHook(() => useWeather(city, 'en'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.error?.kind).toBe('unauthorized'));
  });
});
```

- [ ] **Step 3: Run test — expect failure**

```bash
npm test -- useWeather
```

- [ ] **Step 4: Implement `src/application/hooks/useWeather.ts`**

```ts
import { useQuery } from '@tanstack/react-query';
import type { ApiError, City, Forecast, Weather } from '../../domain/types';
import { weatherService } from '../../infrastructure/api/weatherService';
import { ApiRequestError } from '../../infrastructure/api/httpClient';

export interface UseWeatherResult {
  current: Weather | null;
  forecast: Forecast | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  lastUpdated: Date | null;
}

function toApiError(e: unknown): ApiError {
  if (e instanceof ApiRequestError) return e.info;
  return { kind: 'network' };
}

export function useWeather(city: City | null, lang: 'ru' | 'en'): UseWeatherResult {
  const enabled = !!city;
  const current = useQuery({
    queryKey: ['weather', 'current', city?.id, lang, city?.lat, city?.lon],
    queryFn: () => weatherService.getCurrent({ lat: city!.lat, lon: city!.lon, lang }),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
  const forecast = useQuery({
    queryKey: ['weather', 'forecast', city?.id, lang, city?.lat, city?.lon],
    queryFn: () => weatherService.getForecast({ lat: city!.lat, lon: city!.lon, lang }),
    enabled,
    staleTime: 30 * 60 * 1000,
  });

  const error: ApiError | null = (current.error || forecast.error) ? toApiError(current.error || forecast.error) : null;
  const lastUpdated = current.dataUpdatedAt ? new Date(current.dataUpdatedAt) : null;

  return {
    current: current.data ?? null,
    forecast: forecast.data ?? null,
    isLoading: (current.isLoading || forecast.isLoading) && enabled,
    error,
    refetch: () => { void current.refetch(); void forecast.refetch(); },
    lastUpdated,
  };
}
```

- [ ] **Step 5: Run test — expect pass**

```bash
npm test -- useWeather
```

- [ ] **Step 6: Commit**

```bash
git add src/application/hooks/useWeather.ts src/application/hooks/useWeather.test.tsx src/test/utils.tsx
git commit -m "feat(hooks): useWeather with TanStack Query"
```

---

### Task 20: useCitySearch hook

**Files:**
- Create: `src/application/hooks/useCitySearch.ts`, `src/application/hooks/useCitySearch.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/application/hooks/useCitySearch.test.tsx
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/server';
import { makeWrapper } from '../../test/utils';
import { env } from '../../config/env';
import { useCitySearch } from './useCitySearch';

describe('useCitySearch', () => {
  it('does not fetch for short queries', async () => {
    let called = false;
    server.use(
      http.get(`${env.baseUrl}/geo/1.0/direct`, () => {
        called = true;
        return HttpResponse.json([]);
      }),
    );
    const { result } = renderHook(() => useCitySearch('mo', 'en'), { wrapper: makeWrapper() });
    await new Promise((r) => setTimeout(r, 50));
    expect(called).toBe(false);
    expect(result.current.cities).toEqual([]);
  });

  it('fetches for queries of 3+ chars', async () => {
    server.use(
      http.get(`${env.baseUrl}/geo/1.0/direct`, () => HttpResponse.json([
        { name: 'Moscow', country: 'RU', lat: 55.75, lon: 37.62 },
      ])),
    );
    const { result } = renderHook(() => useCitySearch('Moscow', 'en'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.cities).toHaveLength(1));
    expect(result.current.cities[0]!.name).toBe('Moscow');
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- useCitySearch
```

- [ ] **Step 3: Implement `src/application/hooks/useCitySearch.ts`**

```ts
import { useQuery } from '@tanstack/react-query';
import { geocodingService } from '../../infrastructure/api/geocodingService';
import type { City } from '../../domain/types';

export function useCitySearch(query: string, lang: 'ru' | 'en') {
  const trimmed = query.trim();
  const enabled = trimmed.length >= 3;
  const q = useQuery({
    queryKey: ['geocode', 'search', trimmed, lang],
    queryFn: () => geocodingService.search({ query: trimmed, lang }),
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
  });
  return {
    cities: (q.data ?? []) as City[],
    isLoading: enabled && q.isLoading,
    error: q.error,
  };
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test -- useCitySearch
```

- [ ] **Step 5: Commit**

```bash
git add src/application/hooks/useCitySearch.ts src/application/hooks/useCitySearch.test.tsx
git commit -m "feat(hooks): useCitySearch with min-length guard"
```

---

## Phase 5: UI Primitives

### Task 21: UI primitives (Button, IconButton, Input, Spinner, Card, Skeleton)

**Files:**
- Create: `src/presentation/ui/Button.tsx`, `src/presentation/ui/IconButton.tsx`, `src/presentation/ui/Input.tsx`, `src/presentation/ui/Spinner.tsx`, `src/presentation/ui/Card.tsx`, `src/presentation/ui/Skeleton.tsx`
- Test: `src/presentation/ui/Button.test.tsx`, `src/presentation/ui/Input.test.tsx`

- [ ] **Step 1: Create `src/presentation/ui/Button.tsx`**

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50';
  const styles = variant === 'primary'
    ? 'bg-accent text-white hover:opacity-90'
    : 'bg-transparent text-text hover:bg-surface';
  return <button className={`${base} ${styles} ${className}`} {...rest}>{children}</button>;
}
```

- [ ] **Step 2: Create `src/presentation/ui/IconButton.tsx`**

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  children: ReactNode;
}

export function IconButton({ className = '', children, ...rest }: IconButtonProps) {
  return (
    <button
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface text-text transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 3: Create `src/presentation/ui/Input.tsx`**

```tsx
import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-lg bg-surface px-4 py-2 text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      {...rest}
    />
  );
});
```

- [ ] **Step 4: Create `src/presentation/ui/Spinner.tsx`**

```tsx
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      role="status"
      aria-label="loading"
      className="inline-block animate-spin rounded-full border-2 border-muted border-t-accent"
      style={{ width: size, height: size }}
    />
  );
}
```

- [ ] **Step 5: Create `src/presentation/ui/Card.tsx`**

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`rounded-2xl bg-surface p-4 shadow-sm ${className}`} {...rest}>
      {children}
    </div>
  );
}
```

- [ ] **Step 6: Create `src/presentation/ui/Skeleton.tsx`**

```tsx
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted/20 ${className}`} aria-hidden />;
}
```

- [ ] **Step 7: Write test `src/presentation/ui/Button.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders and fires click', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByText('Go'));
    expect(onClick).toHaveBeenCalled();
  });
  it('is disabled when prop set', () => {
    render(<Button disabled>X</Button>);
    expect(screen.getByText('X')).toBeDisabled();
  });
});
```

- [ ] **Step 8: Write test `src/presentation/ui/Input.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('updates value on change', () => {
    render(<Input placeholder="x" />);
    const el = screen.getByPlaceholderText('x') as HTMLInputElement;
    fireEvent.change(el, { target: { value: 'abc' } });
    expect(el.value).toBe('abc');
  });
});
```

- [ ] **Step 9: Run all tests**

```bash
npm test
```
Expected: all tests pass.

- [ ] **Step 10: Commit**

```bash
git add src/presentation/ui/
git commit -m "feat(ui): base primitives (Button, IconButton, Input, Spinner, Card, Skeleton)"
```

---

## Phase 6: Feature Components

### Task 22: WeatherIcon component

**Files:**
- Create: `src/presentation/components/WeatherIcon.tsx`, `src/presentation/components/WeatherIcon.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/presentation/components/WeatherIcon.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { WeatherIcon } from './WeatherIcon';

describe('WeatherIcon', () => {
  it('renders the right symbol for each code', () => {
    const { container } = render(<WeatherIcon code="clear" />);
    expect(container.textContent).toBe('☀️');
  });
  it('honors size', () => {
    const { container } = render(<WeatherIcon code="rain" size={48} />);
    const span = container.querySelector('span')!;
    expect(span.style.fontSize).toBe('48px');
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- WeatherIcon
```

- [ ] **Step 3: Implement `src/presentation/components/WeatherIcon.tsx`**

```tsx
import { WEATHER_ICON } from '../../domain/weatherCodes';
import type { WeatherCode } from '../../domain/types';

export function WeatherIcon({ code, size = 24 }: { code: WeatherCode; size?: number }) {
  return (
    <span aria-hidden style={{ fontSize: size, lineHeight: 1 }}>
      {WEATHER_ICON[code]}
    </span>
  );
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test -- WeatherIcon
```

- [ ] **Step 5: Commit**

```bash
git add src/presentation/components/WeatherIcon.tsx src/presentation/components/WeatherIcon.test.tsx
git commit -m "feat(components): WeatherIcon"
```

---

### Task 23: Metric and MetricsGrid

**Files:**
- Create: `src/presentation/components/Metric.tsx`, `src/presentation/components/MetricsGrid.tsx`, `src/presentation/components/Metric.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/presentation/components/Metric.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Metric } from './Metric';

describe('Metric', () => {
  it('renders label and value', () => {
    render(<Metric icon="💧" label="Humidity" value="62%" />);
    expect(screen.getByText('Humidity')).toBeInTheDocument();
    expect(screen.getByText('62%')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- Metric
```

- [ ] **Step 3: Implement `src/presentation/components/Metric.tsx`**

```tsx
import type { ReactNode } from 'react';

export function Metric({ icon, label, value }: { icon: string; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-bg/50 p-3">
      <span className="text-xl" aria-hidden>{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement `src/presentation/components/MetricsGrid.tsx`**

```tsx
import type { ReactNode } from 'react';

export function MetricsGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}
```

- [ ] **Step 5: Run — expect pass**

```bash
npm test -- Metric
```

- [ ] **Step 6: Commit**

```bash
git add src/presentation/components/Metric.tsx src/presentation/components/MetricsGrid.tsx src/presentation/components/Metric.test.tsx
git commit -m "feat(components): Metric and MetricsGrid"
```

---

### Task 24: ForecastDay, HourlyItem, ForecastStrip, HourlyList

**Files:**
- Create: `src/presentation/components/ForecastDay.tsx`, `src/presentation/components/HourlyItem.tsx`, `src/presentation/components/ForecastStrip.tsx`, `src/presentation/components/HourlyList.tsx`
- Test: `src/presentation/components/ForecastDay.test.tsx`, `src/presentation/components/HourlyList.test.tsx`

- [ ] **Step 1: Write failing test for ForecastDay**

```tsx
// src/presentation/components/ForecastDay.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ForecastDay } from './ForecastDay';

describe('ForecastDay', () => {
  it('renders min and max with icon and weekday', () => {
    const date = new Date('2026-06-16T00:00:00');
    render(<ForecastDay date={date} min={10} max={20} condition="clear" weekday="Tue" />);
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText(/20°/)).toBeInTheDocument();
    expect(screen.getByText(/10°/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- ForecastDay
```

- [ ] **Step 3: Implement `src/presentation/components/ForecastDay.tsx`**

```tsx
import { WeatherIcon } from './WeatherIcon';
import type { WeatherCode } from '../../domain/types';

export function ForecastDay({
  date,
  min,
  max,
  condition,
  weekday,
}: {
  date: Date;
  min: number;
  max: number;
  condition: WeatherCode;
  weekday: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-bg/40 p-3" aria-label={date.toDateString()}>
      <span className="text-xs text-muted">{weekday}</span>
      <WeatherIcon code={condition} size={28} />
      <div className="flex gap-1 text-sm">
        <span className="font-medium">{Math.round(max)}°</span>
        <span className="text-muted">{Math.round(min)}°</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write failing test for HourlyList**

```tsx
// src/presentation/components/HourlyList.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HourlyList } from './HourlyList';

describe('HourlyList', () => {
  it('renders each hour with temp', () => {
    const points = [
      { time: new Date('2026-06-15T15:00:00'), temp: 18, condition: 'clear' as const },
      { time: new Date('2026-06-15T18:00:00'), temp: 16, condition: 'cloudy' as const },
    ];
    render(<HourlyList points={points} />);
    expect(screen.getByText('18°')).toBeInTheDocument();
    expect(screen.getByText('16°')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run — expect failure**

```bash
npm test -- HourlyList
```

- [ ] **Step 6: Implement `src/presentation/components/HourlyItem.tsx`**

```tsx
import { WeatherIcon } from './WeatherIcon';
import type { WeatherCode } from '../../domain/types';

export function HourlyItem({ time, temp, condition }: { time: Date; temp: number; condition: WeatherCode }) {
  const label = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-bg/30 px-3 py-2">
      <span className="text-xs text-muted">{label}</span>
      <WeatherIcon code={condition} size={20} />
      <span className="text-sm font-medium">{Math.round(temp)}°</span>
    </div>
  );
}
```

- [ ] **Step 7: Implement `src/presentation/components/HourlyList.tsx`**

```tsx
import { HourlyItem } from './HourlyItem';
import type { HourlyPoint } from '../../domain/types';

export function HourlyList({ points }: { points: HourlyPoint[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" data-testid="hourly-list">
      {points.map((p, i) => <HourlyItem key={i} {...p} />)}
    </div>
  );
}
```

- [ ] **Step 8: Implement `src/presentation/components/ForecastStrip.tsx`**

```tsx
import { ForecastDay } from './ForecastDay';
import type { ForecastDay as Day } from '../../domain/types';
import { useTranslation } from '../../application/i18n/useTranslation';

export function ForecastStrip({ days }: { days: Day[] }) {
  const { lang, t } = useTranslation();
  const weekdays = lang === 'ru'
    ? ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-muted">{t('weather.forecastDays', { n: days.length })}</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {days.map((d) => (
          <ForecastDay
            key={d.date.toISOString()}
            date={d.date}
            min={d.min}
            max={d.max}
            condition={d.condition}
            weekday={weekdays[d.date.getDay()]!}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Run — expect pass**

```bash
npm test -- ForecastDay
npm test -- HourlyList
```

- [ ] **Step 10: Commit**

```bash
git add src/presentation/components/ForecastDay.tsx src/presentation/components/ForecastDay.test.tsx src/presentation/components/HourlyItem.tsx src/presentation/components/ForecastStrip.tsx src/presentation/components/HourlyList.tsx src/presentation/components/HourlyList.test.tsx
git commit -m "feat(components): forecast day, hourly, strip"
```

---

### Task 25: CurrentWeatherCard

**Files:**
- Create: `src/presentation/components/CurrentWeatherCard.tsx`, `src/presentation/components/CurrentWeatherCard.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/presentation/components/CurrentWeatherCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '../../application/i18n/useTranslation';
import { CurrentWeatherCard } from './CurrentWeatherCard';

const weather = {
  temp: 18.4,
  feelsLike: 16.2,
  condition: 'cloudy' as const,
  description: 'облачно с прояснениями',
  humidity: 62,
  pressure: 1008,
  windSpeed: 4,
  windDeg: 180,
  uvIndex: 0,
  observedAt: new Date('2026-06-15T12:00:00'),
  sunrise: new Date('2026-06-15T04:00:00'),
  sunset: new Date('2026-06-15T21:00:00'),
};

describe('CurrentWeatherCard', () => {
  it('shows city, temperature and description', () => {
    render(
      <I18nProvider lang="ru" setLang={() => {}}>
        <CurrentWeatherCard cityName="Москва" weather={weather} />
      </I18nProvider>
    );
    expect(screen.getByText('Москва')).toBeInTheDocument();
    expect(screen.getByText('18°')).toBeInTheDocument();
    expect(screen.getByText(/ощущается/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- CurrentWeatherCard
```

- [ ] **Step 3: Implement `src/presentation/components/CurrentWeatherCard.tsx`**

```tsx
import { Card } from '../ui/Card';
import { WeatherIcon } from './WeatherIcon';
import { useTranslation } from '../../application/i18n/useTranslation';
import type { Weather } from '../../domain/types';

export function CurrentWeatherCard({ cityName, weather }: { cityName: string; weather: Weather }) {
  const { lang, t } = useTranslation();
  const time = weather.observedAt.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  return (
    <Card>
      <div className="flex flex-col items-center text-center">
        <div className="text-sm text-muted">{cityName}</div>
        <WeatherIcon code={weather.condition} size={64} />
        <div className="text-7xl font-extralight leading-none">{Math.round(weather.temp)}°</div>
        <div className="mt-1 text-sm capitalize">{weather.description}</div>
        <div className="mt-1 text-xs text-muted">{t('weather.feelsLike', { temp: Math.round(weather.feelsLike) })}</div>
        <div className="mt-1 text-[10px] text-muted">{t('weather.updated', { time })}</div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test -- CurrentWeatherCard
```

- [ ] **Step 5: Commit**

```bash
git add src/presentation/components/CurrentWeatherCard.tsx src/presentation/components/CurrentWeatherCard.test.tsx
git commit -m "feat(components): CurrentWeatherCard"
```

---

### Task 26: ErrorBanner and GeolocationButton

**Files:**
- Create: `src/presentation/components/ErrorBanner.tsx`, `src/presentation/components/ErrorBanner.test.tsx`, `src/presentation/components/GeolocationButton.tsx`, `src/presentation/components/GeolocationButton.test.tsx`

- [ ] **Step 1: Write failing test for ErrorBanner**

```tsx
// src/presentation/components/ErrorBanner.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '../../application/i18n/useTranslation';
import { ErrorBanner } from './ErrorBanner';

describe('ErrorBanner', () => {
  it('renders the localized message for known kinds', () => {
    render(
      <I18nProvider lang="en" setLang={() => {}}>
        <ErrorBanner error={{ kind: 'notFound' }} />
      </I18nProvider>
    );
    expect(screen.getByText(/city not found/i)).toBeInTheDocument();
  });
  it('renders the server message with status', () => {
    render(
      <I18nProvider lang="en" setLang={() => {}}>
        <ErrorBanner error={{ kind: 'server', status: 503 }} />
      </I18nProvider>
    );
    expect(screen.getByText(/503/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- ErrorBanner
```

- [ ] **Step 3: Implement `src/presentation/components/ErrorBanner.tsx`**

```tsx
import { useTranslation } from '../../application/i18n/useTranslation';
import type { ApiError } from '../../domain/types';

function message(error: ApiError, t: (k: string, v?: Record<string, string | number>) => string): string {
  switch (error.kind) {
    case 'network': return t('errors.network');
    case 'notFound': return t('errors.notFound');
    case 'rateLimit': return t('errors.rateLimit');
    case 'unauthorized': return t('errors.unauthorized');
    case 'server': return t('errors.server', { status: error.status });
  }
}

export function ErrorBanner({ error }: { error: ApiError }) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">
      {message(error, t)}
    </div>
  );
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test -- ErrorBanner
```

- [ ] **Step 5: Write failing test for GeolocationButton**

```tsx
// src/presentation/components/GeolocationButton.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '../../application/i18n/useTranslation';
import { GeolocationButton } from './GeolocationButton';

const mockGet = vi.fn();
beforeEach(() => {
  mockGet.mockReset();
  (navigator as unknown as { geolocation: { getCurrentPosition: typeof mockGet } }).geolocation = {
    getCurrentPosition: mockGet,
  };
});

describe('GeolocationButton', () => {
  it('calls onResolved with coords on success', () => {
    mockGet.mockImplementation((s: PositionCallback) => s({ coords: { latitude: 1, longitude: 2 } } as GeolocationPosition));
    const onResolved = vi.fn();
    render(
      <I18nProvider lang="en" setLang={() => {}}>
        <GeolocationButton onResolved={onResolved} />
      </I18nProvider>
    );
    fireEvent.click(screen.getByLabelText(/weather nearby/i));
    expect(onResolved).toHaveBeenCalledWith({ lat: 1, lon: 2 });
  });

  it('calls onError when denied', () => {
    mockGet.mockImplementation((_s: PositionCallback, e: PositionErrorCallback) => e({ code: 1 } as GeolocationPositionError));
    const onError = vi.fn();
    render(
      <I18nProvider lang="en" setLang={() => {}}>
        <GeolocationButton onResolved={() => {}} onError={onError} />
      </I18nProvider>
    );
    fireEvent.click(screen.getByLabelText(/weather nearby/i));
    expect(onError).toHaveBeenCalledWith('denied');
  });
});
```

- [ ] **Step 6: Run — expect failure**

```bash
npm test -- GeolocationButton
```

- [ ] **Step 7: Implement `src/presentation/components/GeolocationButton.tsx`**

```tsx
import { useEffect } from 'react';
import { IconButton } from '../ui/IconButton';
import { useTranslation } from '../../application/i18n/useTranslation';
import { useGeolocation, type GeoStatus } from '../hooks/useGeolocation';

export function GeolocationButton({
  onResolved,
  onError,
}: {
  onResolved: (coords: { lat: number; lon: number }) => void;
  onError?: (status: GeoStatus) => void;
}) {
  const { t } = useTranslation();
  const geo = useGeolocation();

  useEffect(() => {
    if (geo.status === 'success' && geo.coords) onResolved(geo.coords);
    if (geo.status === 'denied' || geo.status === 'unavailable') onError?.(geo.status);
  }, [geo.status, geo.coords, onResolved, onError]);

  return (
    <IconButton aria-label={t('geolocation.button')} onClick={geo.request}>
      📍
    </IconButton>
  );
}
```

- [ ] **Step 8: Run — expect pass**

```bash
npm test -- GeolocationButton
```

- [ ] **Step 9: Commit**

```bash
git add src/presentation/components/ErrorBanner.tsx src/presentation/components/ErrorBanner.test.tsx src/presentation/components/GeolocationButton.tsx src/presentation/components/GeolocationButton.test.tsx
git commit -m "feat(components): ErrorBanner and GeolocationButton"
```

---

### Task 27: SearchBar and CitySuggestions

**Files:**
- Create: `src/presentation/components/SearchBar.tsx`, `src/presentation/components/CitySuggestions.tsx`, `src/presentation/components/SearchBar.test.tsx`

- [ ] **Step 1: Write failing test for SearchBar**

```tsx
// src/presentation/components/SearchBar.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/server';
import { makeWrapper } from '../../test/utils';
import { I18nProvider } from '../../application/i18n/useTranslation';
import { env } from '../../config/env';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('shows suggestions after debounce when typing 3+ chars', async () => {
    server.use(
      http.get(`${env.baseUrl}/geo/1.0/direct`, () => HttpResponse.json([
        { name: 'Moscow', country: 'RU', lat: 55.75, lon: 37.62 },
      ])),
    );
    const onSelect = vi.fn();
    render(
      <I18nProvider lang="en" setLang={() => {}}>
        <SearchBar onSelect={onSelect} />
      </I18nProvider>,
      { wrapper: makeWrapper() }
    );
    const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Moscow' } });
    await waitFor(() => expect(screen.getByText('Moscow')).toBeInTheDocument(), { timeout: 2000 });
    fireEvent.click(screen.getByText('Moscow'));
    expect(onSelect).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- SearchBar
```

- [ ] **Step 3: Implement `src/presentation/components/CitySuggestions.tsx`**

```tsx
import type { City } from '../../domain/types';
import { useTranslation } from '../../application/i18n/useTranslation';

export function CitySuggestions({ cities, onSelect, isLoading }: {
  cities: City[];
  onSelect: (city: City) => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  if (!isLoading && cities.length === 0) return null;
  return (
    <ul role="listbox" className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-muted/30 bg-surface shadow-lg">
      {cities.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            role="option"
            aria-selected="false"
            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-bg/50"
            onClick={() => onSelect(c)}
          >
            <span>{c.name}</span>
            <span className="text-xs text-muted">{c.country}</span>
          </button>
        </li>
      ))}
      {isLoading && (
        <li className="px-4 py-2 text-xs text-muted">{t('app.title')}…</li>
      )}
    </ul>
  );
}
```

- [ ] **Step 4: Implement `src/presentation/components/SearchBar.tsx`**

```tsx
import { useState } from 'react';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { useDebounce } from '../hooks/useDebounce';
import { useCitySearch } from '../../application/hooks/useCitySearch';
import { useTranslation, type Language } from '../../application/i18n/useTranslation';
import type { City } from '../../domain/types';
import { CitySuggestions } from './CitySuggestions';

export function SearchBar({ onSelect }: { onSelect: (city: City) => void }) {
  const { lang, t } = useTranslation();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const { cities, isLoading } = useCitySearch(debounced, lang as Language);

  return (
    <div className="relative flex-1">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('search.placeholder')}
        aria-label={t('search.placeholder')}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2"><Spinner /></div>
      )}
      {debounced.length >= 3 && (
        <CitySuggestions cities={cities} onSelect={onSelect} isLoading={isLoading} />
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run — expect pass**

```bash
npm test -- SearchBar
```

- [ ] **Step 6: Commit**

```bash
git add src/presentation/components/SearchBar.tsx src/presentation/components/SearchBar.test.tsx src/presentation/components/CitySuggestions.tsx
git commit -m "feat(components): SearchBar with debounced suggestions"
```

---

### Task 28: FavoriteChip and FavoritesChips

**Files:**
- Create: `src/presentation/components/FavoriteChip.tsx`, `src/presentation/components/FavoritesChips.tsx`, `src/presentation/components/FavoriteChip.test.tsx`

- [ ] **Step 1: Write failing test for FavoriteChip**

```tsx
// src/presentation/components/FavoriteChip.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FavoriteChip } from './FavoriteChip';

describe('FavoriteChip', () => {
  it('shows active state when selected', () => {
    render(<FavoriteChip label="Москва" selected onClick={() => {}} onRemove={() => {}} />);
    expect(screen.getByText('Москва').className).toMatch(/bg-accent/);
  });
  it('fires onClick and onRemove', () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(<FavoriteChip label="X" selected={false} onClick={onClick} onRemove={onRemove} />);
    fireEvent.click(screen.getByText('X'));
    expect(onClick).toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText(/remove/i));
    expect(onRemove).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- FavoriteChip
```

- [ ] **Step 3: Implement `src/presentation/components/FavoriteChip.tsx`**

```tsx
import { useTranslation } from '../../application/i18n/useTranslation';

export function FavoriteChip({
  label,
  selected,
  onClick,
  onRemove,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const base = 'flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition';
  const styles = selected
    ? 'bg-accent text-white'
    : 'bg-bg/40 text-text hover:bg-bg/60';
  return (
    <span className={`${base} ${styles}`}>
      <button type="button" onClick={onClick} className="flex items-center gap-1">
        {selected && <span aria-hidden>📍</span>}
        {label}
      </button>
      <button
        type="button"
        aria-label={t('favorites.remove')}
        onClick={onRemove}
        className="opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </span>
  );
}
```

- [ ] **Step 4: Implement `src/presentation/components/FavoritesChips.tsx`**

```tsx
import { useFavorites } from '../../application/context/FavoritesContext';
import { FavoriteChip } from './FavoriteChip';

export function FavoritesChips() {
  const { cities, selectedId, select, remove } = useFavorites();
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" data-testid="favorites-chips">
      {cities.map((c) => (
        <FavoriteChip
          key={c.id}
          label={c.name}
          selected={c.id === selectedId}
          onClick={() => select(c.id)}
          onRemove={() => remove(c.id)}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run — expect pass**

```bash
npm test -- FavoriteChip
```

- [ ] **Step 6: Commit**

```bash
git add src/presentation/components/FavoriteChip.tsx src/presentation/components/FavoritesChips.tsx src/presentation/components/FavoriteChip.test.tsx
git commit -m "feat(components): FavoriteChip and FavoritesChips"
```

---

## Phase 7: Layouts and Pages

### Task 29: AppLayout

**Files:**
- Create: `src/presentation/layouts/AppLayout.tsx`

- [ ] **Step 1: Implement `src/presentation/layouts/AppLayout.tsx`**

```tsx
import { useTheme } from '../../application/context/ThemeContext';
import { useLanguage, useTranslation } from '../../application/i18n/useTranslation';
import type { ReactNode } from 'react';
import type { Theme } from '../../application/context/ThemeContext';

const THEME_ORDER: Theme[] = ['light', 'dark', 'auto'];

export function AppLayout({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-4 p-4">
      <header className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-lg font-semibold">{t('app.title')}</h1>

        <div role="group" aria-label={t('theme.label')} className="flex overflow-hidden rounded-full bg-surface text-sm">
          {THEME_ORDER.map((th) => (
            <button
              key={th}
              onClick={() => setTheme(th)}
              aria-pressed={theme === th}
              className={`px-3 py-1 ${theme === th ? 'bg-accent text-white' : 'text-muted'}`}
            >
              {t(`theme.${th}` as const)}
            </button>
          ))}
        </div>

        <div role="group" aria-label={t('language.label')} className="flex overflow-hidden rounded-full bg-surface text-sm">
          {(['ru', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`px-3 py-1 ${lang === l ? 'bg-accent text-white' : 'text-muted'}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/presentation/layouts/
git commit -m "feat(layout): AppLayout with theme and language switchers"
```

---

### Task 30: HomePage

**Files:**
- Create: `src/presentation/pages/HomePage.tsx`, `src/presentation/pages/HomePage.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/presentation/pages/HomePage.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/server';
import { env } from '../../config/env';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('renders current temperature for the default city', async () => {
    server.use(
      http.get(`${env.baseUrl}/data/2.5/weather`, () => HttpResponse.json({
        main: { temp: 10, feels_like: 8, humidity: 50, pressure: 1000 },
        weather: [{ id: 800, main: 'Clear', description: 'clear' }],
        wind: { speed: 1, deg: 0 },
        dt: 1718450000, sys: { sunrise: 1718420000, sunset: 1718480000 },
      })),
      http.get(`${env.baseUrl}/data/2.5/forecast`, () => HttpResponse.json({ list: [] })),
    );
    render(<HomePage />);
    await waitFor(() => expect(screen.getByText('10°')).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test -- HomePage
```

- [ ] **Step 3: Implement `src/presentation/pages/HomePage.tsx`**

```tsx
import { useFavorites } from '../../application/context/FavoritesContext';
import { useLanguage } from '../../application/i18n/useTranslation';
import { useWeather } from '../../application/hooks/useWeather';
import { SearchBar } from '../components/SearchBar';
import { FavoritesChips } from '../components/FavoritesChips';
import { CurrentWeatherCard } from '../components/CurrentWeatherCard';
import { MetricsGrid } from '../components/MetricsGrid';
import { Metric } from '../components/Metric';
import { HourlyList } from '../components/HourlyList';
import { ForecastStrip } from '../components/ForecastStrip';
import { ErrorBanner } from '../components/ErrorBanner';
import { GeolocationButton } from '../components/GeolocationButton';
import { Spinner } from '../ui/Spinner';
import { geocodingService } from '../../infrastructure/api/geocodingService';

export function HomePage() {
  const { selectedCity, isFavorite, add, select } = useFavorites();
  const { lang } = useLanguage();
  const weather = useWeather(selectedCity, lang);

  async function onGeoResolved(coords: { lat: number; lon: number }) {
    const city = await geocodingService.reverse(coords);
    if (city) {
      if (!isFavorite(city.id)) add(city);
      select(city.id);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <SearchBar onSelect={(c) => { if (!isFavorite(c.id)) add(c); select(c.id); }} />
        <GeolocationButton onResolved={onGeoResolved} />
      </div>

      <FavoritesChips />

      {weather.error && <ErrorBanner error={weather.error} />}

      {weather.isLoading && (
        <div className="flex justify-center p-8" data-testid="loading">
          <Spinner size={32} />
        </div>
      )}

      {selectedCity && weather.current && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <CurrentWeatherCard cityName={selectedCity.name} weather={weather.current} />
            <MetricsGrid>
              <Metric icon="💧" label="Humidity" value={`${weather.current.humidity}%`} />
              <Metric icon="💨" label="Wind" value={`${weather.current.windSpeed} m/s`} />
              <Metric icon="🌡️" label="Pressure" value={`${weather.current.pressure} hPa`} />
              <Metric icon="☀️" label="UV" value={`${weather.current.uvIndex}`} />
            </MetricsGrid>
          </div>
          {weather.forecast && (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-surface p-4">
                <h3 className="mb-2 text-sm font-medium text-muted">Hourly</h3>
                <HourlyList points={weather.forecast.hourly.slice(0, 6)} />
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <ForecastStrip days={weather.forecast.daily} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test -- HomePage
```

- [ ] **Step 5: Commit**

```bash
git add src/presentation/pages/
git commit -m "feat(pages): HomePage wiring data to components"
```

---

## Phase 8: Wiring and Final Polish

### Task 31: Wire main.tsx, App.tsx with providers

**Files:**
- Modify: `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1: Replace `src/App.tsx`**

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './application/context/LanguageContext';
import { ThemeProvider } from './application/context/ThemeContext';
import { FavoritesProvider } from './application/context/FavoritesContext';
import { AppLayout } from './presentation/layouts/AppLayout';
import { HomePage } from './presentation/pages/HomePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 10 * 60 * 1000, gcTime: 30 * 60 * 1000, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <FavoritesProvider>
            <AppLayout>
              <HomePage />
            </AppLayout>
          </FavoritesProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Replace `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```
Expected: builds without errors. Warnings about chunk size are OK.

- [ ] **Step 4: Run all tests**

```bash
npm test
```
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: wire providers and mount HomePage"
```

---

### Task 32: Add `.gitignore` and README

**Files:**
- Modify: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: Verify `.gitignore` exists and contains node_modules**

```bash
cat .gitignore | grep node_modules
```
Expected: a line. If missing, add `node_modules`, `dist`, `.env`, `.superpowers`.

Replace `.gitignore` with:
```
node_modules
dist
dist-ssr
*.local
.env
.env.local
.superpowers
coverage
.DS_Store
*.log
```

- [ ] **Step 2: Create `README.md`**

```markdown
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
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs: add README and gitignore"
```

---

### Task 33: Final verification

- [ ] **Step 1: Run full test suite**

```bash
npm test
```
Expected: all tests pass.

- [ ] **Step 2: Run build**

```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 3: Manual smoke test**

```bash
npm run dev
```
Open `http://localhost:5173` in a browser. Verify:
- Default city (Москва) loads with current weather
- Search field shows suggestions after typing 3+ chars
- Clicking a suggestion adds it to favorites and switches view
- Clicking a chip switches between cities
- Theme switcher toggles dark/light immediately
- Language switcher swaps all strings and re-fetches API
- Geolocation button prompts browser for permission; on success, finds city
- Page is responsive: collapses to single column below 768px
- No console errors in DevTools

- [ ] **Step 4: Final commit if any tweaks**

```bash
git add -A
git diff --cached --quiet || git commit -m "chore: final tweaks"
```

---

## Self-Review Notes

- Spec §3 (architecture) → Tasks 6–13 cover all four layers and their boundaries.
- Spec §4 (structure) → tasks produce files in the exact paths listed.
- Spec §5 (types) → Task 6.
- Spec §6 (data layer) → Tasks 7, 8, 9, 10, 11, 12, 13, 19, 20.
- Spec §7 (state) → Tasks 15, 16, 17.
- Spec §8 (UI/UX) → Tasks 21–30.
- Spec §9 (testing) → Vitest+RTL+MSW set up in Tasks 4, 5; tests in each implementation task.
- Spec §10 (DoD) → Task 33.
- Spec §11 (commands) → Task 4 + package.json scripts.
- All tech names consistent: `useWeather`, `useCitySearch`, `useFavorites`, `useTheme`, `useLanguage`, `mapCurrentWeather`, `mapForecast`, `mapCity`, `mapWeatherCode`, `ApiRequestError`, `httpClient`, `weatherService`, `geocodingService`, `LanguageProvider`, `ThemeProvider`, `FavoritesProvider`, `I18nProvider`, `AppLayout`, `HomePage`.
- No `TODO`/`TBD`/`fix later` placeholders.
