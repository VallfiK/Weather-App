import { WeatherIcon } from './WeatherIcon';
import type { WeatherCode } from '../../domain/types';

export function ForecastDay({
  date,
  min,
  max,
  condition,
  weekday,
}: {
  date: Date;
  min: number;
  max: number;
  condition: WeatherCode;
  weekday: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-bg/40 p-3" aria-label={date.toDateString()}>
      <span className="text-xs text-muted">{weekday}</span>
      <WeatherIcon code={condition} size={28} />
      <div className="flex gap-1 text-sm">
        <span className="font-medium">{Math.round(max)}°</span>
        <span className="text-muted">{Math.round(min)}°</span>
      </div>
    </div>
  );
}
