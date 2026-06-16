import type { WeatherCode } from './types';

export function mapWeatherCode(owId: number): WeatherCode {
  if (owId === 800) return 'clear';
  if (owId === 801) return 'partlyCloudy';
  if (owId === 802) return 'cloudy';
  if (owId === 803 || owId === 804) return 'overcast';
  if (owId >= 700 && owId <= 781) return 'fog';
  if (owId >= 300 && owId <= 321) return 'drizzle';
  if (owId >= 520 && owId <= 531) return 'heavyRain';
  if (owId >= 502 && owId <= 504) return 'heavyRain';
  if (owId >= 500 && owId <= 501) return 'rain';
  if (owId === 611 || owId === 612) return 'sleet';
  if (owId >= 600 && owId <= 601) return 'snow';
  if (owId >= 602 && owId <= 622) return 'heavySnow';
  if (owId >= 200 && owId <= 232) return 'thunderstorm';
  return 'cloudy';
}

export const WEATHER_ICON: Record<WeatherCode, string> = {
  clear: '☀️',
  partlyCloudy: '⛅',
  cloudy: '☁️',
  overcast: '☁️',
  fog: '🌫️',
  drizzle: '💧',
  rain: '🌧️',
  heavyRain: '⛈️',
  snow: '🌨️',
  heavySnow: '❄️',
  sleet: '🌨️',
  thunderstorm: '⛈️',
};
