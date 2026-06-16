import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('*/test', () => HttpResponse.json({ ok: true })),
];
