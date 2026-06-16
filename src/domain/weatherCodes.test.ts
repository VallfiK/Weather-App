import { describe, it, expect } from 'vitest';
import { mapWeatherCode } from './weatherCodes';

describe('mapWeatherCode', () => {
  it('maps clear sky (800) to clear', () => {
    expect(mapWeatherCode(800)).toBe('clear');
  });
  it('maps few clouds (801) to partlyCloudy', () => {
    expect(mapWeatherCode(801)).toBe('partlyCloudy');
  });
  it('maps scattered clouds (802) to cloudy', () => {
    expect(mapWeatherCode(802)).toBe('cloudy');
  });
  it('maps broken/overcast (803/804) to overcast', () => {
    expect(mapWeatherCode(803)).toBe('overcast');
    expect(mapWeatherCode(804)).toBe('overcast');
  });
  it('maps fog/mist/haze (701-781) to fog', () => {
    expect(mapWeatherCode(701)).toBe('fog');
    expect(mapWeatherCode(741)).toBe('fog');
    expect(mapWeatherCode(781)).toBe('fog');
  });
  it('maps drizzle (300-321) to drizzle', () => {
    expect(mapWeatherCode(300)).toBe('drizzle');
    expect(mapWeatherCode(321)).toBe('drizzle');
  });
  it('maps rain 500-509 to rain, 520+ to heavyRain', () => {
    expect(mapWeatherCode(500)).toBe('rain');
    expect(mapWeatherCode(501)).toBe('rain');
    expect(mapWeatherCode(502)).toBe('heavyRain');
    expect(mapWeatherCode(522)).toBe('heavyRain');
  });
  it('maps snow 600-609 to snow, 620+ to heavySnow', () => {
    expect(mapWeatherCode(600)).toBe('snow');
    expect(mapWeatherCode(601)).toBe('snow');
    expect(mapWeatherCode(602)).toBe('heavySnow');
    expect(mapWeatherCode(622)).toBe('heavySnow');
  });
  it('maps sleet 611 to sleet', () => {
    expect(mapWeatherCode(611)).toBe('sleet');
  });
  it('maps thunderstorm (200-232) to thunderstorm', () => {
    expect(mapWeatherCode(200)).toBe('thunderstorm');
    expect(mapWeatherCode(232)).toBe('thunderstorm');
  });
  it('falls back to cloudy for unknown codes', () => {
    expect(mapWeatherCode(999)).toBe('cloudy');
  });
});
