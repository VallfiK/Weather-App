import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/server';
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
