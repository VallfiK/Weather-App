import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { City } from '../../domain/types';
import { readStorage, writeStorage } from '../../infrastructure/storage/localStorage';

const STORAGE_KEY = 'weather-app:favorites:v1';
const DEFAULT_CITY: City = {
  id: 'Moscow,RU,55.75,37.62',
  name: 'Moscow',
  country: 'RU',
  lat: 55.75,
  lon: 37.62,
};

interface Stored {
  cities: City[];
  selectedId: string | null;
}

function loadInitial(): Stored {
  const stored = readStorage<Stored>(STORAGE_KEY);
  if (stored && Array.isArray(stored.cities)) return stored;
  return { cities: [DEFAULT_CITY], selectedId: DEFAULT_CITY.id };
}

interface FavoritesContextValue {
  cities: City[];
  selectedId: string | null;
  selectedCity: City | null;
  add: (city: City) => void;
  remove: (id: string) => void;
  select: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored>(() => loadInitial());

  useEffect(() => {
    writeStorage(STORAGE_KEY, state);
  }, [state]);

  const add = useCallback((city: City) => {
    setState((s) => {
      if (s.cities.some((c) => c.id === city.id)) return s;
      return { ...s, cities: [...s.cities, city] };
    });
  }, []);

  const remove = useCallback((id: string) => {
    setState((s) => {
      const cities = s.cities.filter((c) => c.id !== id);
      const selectedId = s.selectedId === id ? (cities[0]?.id ?? null) : s.selectedId;
      return { cities, selectedId };
    });
  }, []);

  const select = useCallback((id: string) => {
    setState((s) => (s.selectedId === id ? s : { ...s, selectedId: id }));
  }, []);

  const isFavorite = useCallback(
    (id: string) => state.cities.some((c) => c.id === id),
    [state.cities],
  );

  const value = useMemo<FavoritesContextValue>(() => {
    const selectedCity = state.cities.find((c) => c.id === state.selectedId) ?? null;
    return {
      cities: state.cities,
      selectedId: state.selectedId,
      selectedCity,
      add,
      remove,
      select,
      isFavorite,
    };
  }, [state, add, remove, select, isFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
