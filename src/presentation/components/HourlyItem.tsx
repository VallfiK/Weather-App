import { WeatherIcon } from './WeatherIcon';
import type { WeatherCode } from '../../domain/types';

export function HourlyItem({ time, temp, condition }: { time: Date; temp: number; condition: WeatherCode }) {
  const label = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-bg/30 px-3 py-2">
      <span className="text-xs text-muted">{label}</span>
      <WeatherIcon code={condition} size={20} />
      <span className="text-sm font-medium">{Math.round(temp)}°</span>
    </div>
  );
}
