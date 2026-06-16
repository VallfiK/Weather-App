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
