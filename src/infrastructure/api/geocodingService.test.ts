import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/server';
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

  it('search dedupes results with the same lat,lon, keeping the query-script match', async () => {
    server.use(
      http.get(`${env.baseUrl}/geo/1.0/direct`, () => HttpResponse.json([
        { name: 'Москва', country: 'RU', lat: 55.75, lon: 37.62 },
        { name: 'Moscow', country: 'RU', lat: 55.75, lon: 37.62 },
      ])),
    );
    // Query is Cyrillic → prefer Cyrillic, filter keeps Cyrillic.
    const cities = await geocodingService.search({ query: 'Москва', lang: 'ru' });
    expect(cities).toHaveLength(1);
    expect(cities[0]!.name).toBe('Москва');
  });

  it('search keeps the query-script result when only the script differs at the same coords', async () => {
    server.use(
      http.get(`${env.baseUrl}/geo/1.0/direct`, () => HttpResponse.json([
        { name: 'Krasnodar', country: 'RU', lat: 45.04, lon: 38.97 },
        { name: 'Краснодар', country: 'RU', lat: 45.04, lon: 38.97 },
      ])),
    );
    const cities = await geocodingService.search({ query: 'Краснодар', lang: 'ru' });
    expect(cities).toHaveLength(1);
    expect(cities[0]!.name).toBe('Краснодар');
  });

  it('search filters out opposite-script results when query is Cyrillic and coords differ', async () => {
    // OpenWeather sometimes returns the same city at slightly different
    // coordinates with names in different scripts. Dedupe by lat,lon won't
    // merge them, so we filter by query script to keep only the matching one.
    server.use(
      http.get(`${env.baseUrl}/geo/1.0/direct`, () => HttpResponse.json([
        { name: 'Krasnodar', country: 'RU', lat: 45.0448, lon: 38.9760 },
        { name: 'Краснодар', country: 'RU', lat: 45.0400, lon: 38.9700 },
      ])),
    );
    const cities = await geocodingService.search({ query: 'Краснодар', lang: 'ru' });
    expect(cities).toHaveLength(1);
    expect(cities[0]!.name).toBe('Краснодар');
  });

  it('search falls back to unfiltered results when query script has no matches', async () => {
    // OpenWeather sometimes returns Latin names even when lang=ru and the
    // query is Cyrillic. We must not return an empty list in that case.
    server.use(
      http.get(`${env.baseUrl}/geo/1.0/direct`, () => HttpResponse.json([
        { name: 'Moscow', country: 'RU', lat: 55.75, lon: 37.62 },
        { name: 'Moskva', country: 'RU', lat: 55.76, lon: 37.63 },
      ])),
    );
    const cities = await geocodingService.search({ query: 'М', lang: 'ru' });
    expect(cities.map((c) => c.name)).toEqual(['Moscow', 'Moskva']);
  });

  it('search prefers country=RU results when Cyrillic query has only Latin matches', async () => {
    // User-reported scenario: typing "Москва" with lang=ru yields a mix of
    // Latin-named cities from multiple countries. We must prefer the one
    // whose country matches the user's selected language (RU for Russian).
    server.use(
      http.get(`${env.baseUrl}/geo/1.0/direct`, () => HttpResponse.json([
        { name: 'Moscow', country: 'RU', lat: 55.75, lon: 37.62 },
        { name: 'Moscow', country: 'US', lat: 46.73, lon: -117.0 },
        { name: 'Berarar sahercesi', country: 'TM', lat: 38.97, lon: 56.27 },
        { name: 'Moskwa', country: 'PL', lat: 52.23, lon: 21.0 },
      ])),
    );
    const cities = await geocodingService.search({ query: 'Москва', lang: 'ru' });
    expect(cities.map((c) => c.name)).toEqual(['Moscow']);
    expect(cities[0]!.country).toBe('RU');
  });

  it('search falls back to unfiltered results when query is Latin but results are all Cyrillic', async () => {
    server.use(
      http.get(`${env.baseUrl}/geo/1.0/direct`, () => HttpResponse.json([
        { name: 'Москва', country: 'RU', lat: 55.75, lon: 37.62 },
        { name: 'Краснодар', country: 'RU', lat: 45.04, lon: 38.97 },
      ])),
    );
    const cities = await geocodingService.search({ query: 'M', lang: 'en' });
    expect(cities.map((c) => c.name)).toEqual(['Москва', 'Краснодар']);
  });

  it('search returns Latin-only results when query is Latin and matching results exist', async () => {
    server.use(
      http.get(`${env.baseUrl}/geo/1.0/direct`, () => HttpResponse.json([
        { name: 'Москва', country: 'RU', lat: 55.75, lon: 37.62 },
        { name: 'Moscow', country: 'RU', lat: 55.76, lon: 37.63 },
        { name: 'Krasnodar', country: 'RU', lat: 45.04, lon: 38.97 },
      ])),
    );
    const cities = await geocodingService.search({ query: 'M', lang: 'en' });
    expect(cities.map((c) => c.name)).toEqual(['Moscow', 'Krasnodar']);
  });
});
