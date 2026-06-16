import { Card } from '../ui/Card';
import { WeatherIcon } from './WeatherIcon';
import { useTranslation } from '../../application/i18n/useTranslation';
import type { Weather } from '../../domain/types';

export function CurrentWeatherCard({ cityName, weather }: { cityName: string; weather: Weather }) {
  const { lang, t } = useTranslation();
  const time = weather.observedAt.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  return (
    <Card>
      <div className="flex flex-col items-center text-center">
        <div className="text-sm text-muted">{cityName}</div>
        <WeatherIcon code={weather.condition} size={64} />
        <div className="text-7xl font-extralight leading-none">{Math.round(weather.temp)}°</div>
        <div className="mt-1 text-sm capitalize">{weather.description}</div>
        <div className="mt-1 text-xs text-muted">{t('weather.feelsLike', { temp: Math.round(weather.feelsLike) })}</div>
        <div className="mt-1 text-[10px] text-muted">{t('weather.updated', { time })}</div>
      </div>
    </Card>
  );
}
