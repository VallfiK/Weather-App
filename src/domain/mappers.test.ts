import { describe, it, expect } from 'vitest';
import { mapCurrentWeather, mapForecast, mapCity } from './mappers';

const sampleCurrent = {
  main: { temp: 18.4, feels_like: 16.2, humidity: 62, pressure: 1008 },
  weather: [{ id: 802, main: 'Clouds', description: 'облачно с прояснениями' }],
  wind: { speed: 4, deg: 180 },
  dt: 1718450000,
  sys: { sunrise: 1718420000, sunset: 1718480000 },
};

const sampleForecast = {
  list: [
    { dt: 1718460000, main: { temp: 19, temp_min: 17, temp_max: 21 }, weather: [{ id: 800, main: 'Clear', description: 'ясно' }] },
    { dt: 1718470800, main: { temp: 18, temp_min: 16, temp_max: 20 }, weather: [{ id: 801, main: 'Clouds', description: 'небольшая облачность' }] },
    { dt: 1718481600, main: { temp: 12, temp_min: 10, temp_max: 14 }, weather: [{ id: 500, main: 'Rain', description: 'небольшой дождь' }] },
    { dt: 1718550000, main: { temp: 20, temp_min: 18, temp_max: 22 }, weather: [{ id: 800, main: 'Clear', description: 'ясно' }] },
  ],
};

describe('mapCurrentWeather', () => {
  it('maps OW current response to Weather', () => {
    const w = mapCurrentWeather(sampleCurrent);
    expect(w.temp).toBe(18.4);
    expect(w.feelsLike).toBe(16.2);
    expect(w.condition).toBe('cloudy');
    expect(w.description).toBe('облачно с прояснениями');
    expect(w.humidity).toBe(62);
    expect(w.pressure).toBe(1008);
    expect(w.windSpeed).toBe(4);
    expect(w.windDeg).toBe(180);
    expect(w.observedAt).toBeInstanceOf(Date);
    expect(w.sunrise).toBeInstanceOf(Date);
    expect(w.sunset).toBeInstanceOf(Date);
  });
  it('exposes uvIndex as 0 when API did not return it (free tier)', () => {
    const w = mapCurrentWeather(sampleCurrent);
    expect(w.uvIndex).toBe(0);
  });
});

describe('mapForecast', () => {
  it('groups 3h blocks into daily with min/max and noon icon', () => {
    const f = mapForecast(sampleForecast);
    expect(f.daily.length).toBeGreaterThanOrEqual(2);
    const first = f.daily[0]!;
    expect(first.min).toBeLessThanOrEqual(first.max);
    expect(typeof first.condition).toBe('string');
  });
  it('produces hourly points from the 3h blocks', () => {
    const f = mapForecast(sampleForecast);
    expect(f.hourly.length).toBe(4);
    expect(f.hourly[0]!.time).toBeInstanceOf(Date);
  });
});

describe('mapCity', () => {
  it('builds a stable id and copies fields', () => {
    const c = mapCity({ name: 'Moscow', country: 'RU', lat: 55.75, lon: 37.62 });
    expect(c.id).toBe('Moscow,RU,55.75,37.62');
    expect(c.name).toBe('Moscow');
    expect(c.country).toBe('RU');
    expect(c.lat).toBe(55.75);
    expect(c.lon).toBe(37.62);
  });
});
