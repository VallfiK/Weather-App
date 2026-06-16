import { ForecastDay } from './ForecastDay';
import type { ForecastDay as Day } from '../../domain/types';
import { useTranslation } from '../../application/i18n/useTranslation';

export function ForecastStrip({ days }: { days: Day[] }) {
  const { lang, t } = useTranslation();
  const weekdays = lang === 'ru'
    ? ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-muted">{t('weather.forecastDays', { n: days.length })}</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {days.map((d) => (
          <ForecastDay
            key={d.date.toISOString()}
            date={d.date}
            min={d.min}
            max={d.max}
            condition={d.condition}
            weekday={weekdays[d.date.getDay()]!}
          />
        ))}
      </div>
    </div>
  );
}
