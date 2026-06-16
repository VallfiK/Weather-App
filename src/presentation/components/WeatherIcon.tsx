import { WEATHER_ICON } from '../../domain/weatherCodes';
import type { WeatherCode } from '../../domain/types';

export function WeatherIcon({ code, size = 24 }: { code: WeatherCode; size?: number }) {
  return (
    <span aria-hidden style={{ fontSize: size, lineHeight: 1 }}>
      {WEATHER_ICON[code]}
    </span>
  );
}
