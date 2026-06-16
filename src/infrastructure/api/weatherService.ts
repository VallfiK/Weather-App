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
