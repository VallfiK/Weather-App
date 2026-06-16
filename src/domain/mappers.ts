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
