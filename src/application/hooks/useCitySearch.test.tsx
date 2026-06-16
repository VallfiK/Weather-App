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
