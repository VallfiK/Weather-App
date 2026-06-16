import { useQuery } from '@tanstack/react-query';
import { geocodingService } from '../../infrastructure/api/geocodingService';
import type { City } from '../../domain/types';

export function useCitySearch(query: string, lang: 'ru' | 'en') {
  const trimmed = query.trim();
  const enabled = trimmed.length >= 3;
  const q = useQuery({
    queryKey: ['geocode', 'search', trimmed, lang],
    queryFn: () => geocodingService.search({ query: trimmed, lang }),
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
  });
  return {
    cities: (q.data ?? []) as City[],
    isLoading: enabled && q.isLoading,
    error: q.error,
  };
}
