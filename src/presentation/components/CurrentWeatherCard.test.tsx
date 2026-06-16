import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '../../application/i18n/useTranslation';
import { CurrentWeatherCard } from './CurrentWeatherCard';

const weather = {
  temp: 18.4,
  feelsLike: 16.2,
  condition: 'cloudy' as const,
  description: 'облачно с прояснениями',
  humidity: 62,
  pressure: 1008,
  windSpeed: 4,
  windDeg: 180,
  uvIndex: 0,
  observedAt: new Date('2026-06-15T12:00:00'),
  sunrise: new Date('2026-06-15T04:00:00'),
  sunset: new Date('2026-06-15T21:00:00'),
};

describe('CurrentWeatherCard', () => {
  it('shows city, temperature and description', () => {
    render(
      <I18nProvider lang="ru" setLang={() => {}}>
        <CurrentWeatherCard cityName="Москва" weather={weather} />
      </I18nProvider>
    );
    expect(screen.getByText('Москва')).toBeInTheDocument();
    expect(screen.getByText('18°')).toBeInTheDocument();
    expect(screen.getByText(/ощущается/i)).toBeInTheDocument();
  });
});
