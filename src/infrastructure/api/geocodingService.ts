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
    const isCyrillic = (s: string) => /[Ѐ-ӿ]/.test(s);
    // Use the QUERY script (not the user's selected language) as the source of
    // truth. OpenWeather's `lang=` parameter is unreliable: for some queries
    // (e.g. "Москва") it returns Latin names even when `lang=ru`; for others
    // (e.g. "Краснодар") it returns Cyrillic. Matching what the user typed
    // gives the most predictable UX.
    const queryIsCyrillic = isCyrillic(query);
    const matchesScript = (s: string) => (queryIsCyrillic ? isCyrillic(s) : !isCyrillic(s));
    // Step 1: dedupe by lat,lon (rounded to 2 decimals), prefer matching-script name.
    const seen = new Map<string, RawGeo>();
    for (const item of raw) {
      const key = `${item.lat.toFixed(2)},${item.lon.toFixed(2)}`;
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, item);
        continue;
      }
      if (!matchesScript(existing.name) && matchesScript(item.name)) {
        seen.set(key, item);
      }
    }
    // Step 2: filter results to the query's script. If OpenWeather returned
    // only opposite-script names (so the filter would empty the list), try
    // a country-based fallback for `lang=ru` (prefer `country=RU`) so that
    // e.g. "Москва" still finds Moscow, RU instead of Moscow, US / PL / TM.
    // If even that yields nothing, fall back to the deduped list as a last
    // resort so the user sees *something*.
    const deduped = [...seen.values()];
    const scriptMatches = deduped.filter((item) => matchesScript(item.name));
    if (scriptMatches.length > 0) return scriptMatches.map(mapCity);
    if (lang === 'ru') {
      const ruMatches = deduped.filter((item) => item.country === 'RU');
      if (ruMatches.length > 0) return ruMatches.map(mapCity);
    }
    return deduped.map(mapCity);
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
