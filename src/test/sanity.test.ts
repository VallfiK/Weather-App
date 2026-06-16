import { describe, it, expect } from 'vitest';
import { server } from './server';
import { http, HttpResponse } from 'msw';

describe('sanity', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});

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
