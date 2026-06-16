import { useFavorites } from '../../application/context/FavoritesContext';
import { useLanguage } from '../../application/context/LanguageContext';
import { useWeather } from '../../application/hooks/useWeather';
import { useTranslation } from '../../application/i18n/useTranslation';
import { SearchBar } from '../components/SearchBar';
import { FavoritesChips } from '../components/FavoritesChips';
import { CurrentWeatherCard } from '../components/CurrentWeatherCard';
import { MetricsGrid } from '../components/MetricsGrid';
import { Metric } from '../components/Metric';
import { HourlyList } from '../components/HourlyList';
import { ForecastStrip } from '../components/ForecastStrip';
import { ErrorBanner } from '../components/ErrorBanner';
import { GeolocationButton } from '../components/GeolocationButton';
import { Spinner } from '../ui/Spinner';
import { geocodingService } from '../../infrastructure/api/geocodingService';

export function HomePage() {
  const { selectedCity, isFavorite, add, select } = useFavorites();
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const weather = useWeather(selectedCity, lang);

  async function onGeoResolved(coords: { lat: number; lon: number }) {
    const city = await geocodingService.reverse(coords);
    if (city) {
      if (!isFavorite(city.id)) add(city);
      select(city.id);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <SearchBar onSelect={(c) => { if (!isFavorite(c.id)) add(c); select(c.id); }} />
        <GeolocationButton onResolved={onGeoResolved} />
      </div>

      <FavoritesChips />

      {weather.error && <ErrorBanner error={weather.error} />}

      {weather.isLoading && (
        <div className="flex justify-center p-8" data-testid="loading">
          <Spinner size={32} />
        </div>
      )}

      {selectedCity && weather.current && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <CurrentWeatherCard cityName={selectedCity.name} weather={weather.current} />
            <MetricsGrid>
              <Metric icon="💧" label={t('weather.humidity')} value={`${weather.current.humidity}%`} />
              <Metric icon="💨" label={t('weather.wind')} value={`${weather.current.windSpeed} m/s`} />
              <Metric icon="🌡️" label={t('weather.pressure')} value={`${weather.current.pressure} hPa`} />
              <Metric icon="☀️" label={t('weather.uv')} value={`${weather.current.uvIndex}`} />
            </MetricsGrid>
          </div>
          {weather.forecast && (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-surface p-4">
                <h3 className="mb-2 text-sm font-medium text-muted">{t('weather.hourly')}</h3>
                <HourlyList points={weather.forecast.hourly.slice(0, 6)} />
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <ForecastStrip days={weather.forecast.daily} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
