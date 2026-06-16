import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/server';
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
    await expect(httpClient.get('https://api.test/missing')).rejects.toMatchObject({ info: { kind: 'notFound' } });
  });

  it('throws unauthorized on 401', async () => {
    server.use(
      http.get('https://api.test/no', () => HttpResponse.json({}, { status: 401 })),
    );
    await expect(httpClient.get('https://api.test/no')).rejects.toMatchObject({ info: { kind: 'unauthorized' } });
  });

  it('throws rateLimit on 429', async () => {
    server.use(
      http.get('https://api.test/limit', () => HttpResponse.json({}, { status: 429 })),
    );
    await expect(httpClient.get('https://api.test/limit')).rejects.toMatchObject({ info: { kind: 'rateLimit' } });
  });

  it('throws server on 500', async () => {
    server.use(
      http.get('https://api.test/boom', () => HttpResponse.json({}, { status: 500 })),
    );
    await expect(httpClient.get('https://api.test/boom')).rejects.toMatchObject({ info: { kind: 'server', status: 500 } });
  });

  it('throws network on fetch failure', async () => {
    server.use(
      http.get('https://api.test/down', () => HttpResponse.error()),
    );
    await expect(httpClient.get('https://api.test/down')).rejects.toMatchObject({ info: { kind: 'network' } });
  });
});
