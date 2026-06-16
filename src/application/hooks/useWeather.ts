import { useQuery } from '@tanstack/react-query';
import type { ApiError, City, Forecast, Weather } from '../../domain/types';
import { weatherService } from '../../infrastructure/api/weatherService';
import { ApiRequestError } from '../../infrastructure/api/httpClient';

export interface UseWeatherResult {
  current: Weather | null;
  forecast: Forecast | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  lastUpdated: Date | null;
}

function toApiError(e: unknown): ApiError {
  if (e instanceof ApiRequestError) return e.info;
  return { kind: 'network' };
}

export function useWeather(city: City | null, lang: 'ru' | 'en'): UseWeatherResult {
  const enabled = !!city;
  const current = useQuery({
    queryKey: ['weather', 'current', city?.id, lang, city?.lat, city?.lon],
    queryFn: () => weatherService.getCurrent({ lat: city!.lat, lon: city!.lon, lang }),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
  const forecast = useQuery({
    queryKey: ['weather', 'forecast', city?.id, lang, city?.lat, city?.lon],
    queryFn: () => weatherService.getForecast({ lat: city!.lat, lon: city!.lon, lang }),
    enabled,
    staleTime: 30 * 60 * 1000,
  });

  const error: ApiError | null = (current.error || forecast.error) ? toApiError(current.error || forecast.error) : null;
  const lastUpdated = current.dataUpdatedAt ? new Date(current.dataUpdatedAt) : null;

  return {
    current: current.data ?? null,
    forecast: forecast.data ?? null,
    isLoading: (current.isLoading || forecast.isLoading) && enabled,
    error,
    refetch: () => { void current.refetch(); void forecast.refetch(); },
    lastUpdated,
  };
}
