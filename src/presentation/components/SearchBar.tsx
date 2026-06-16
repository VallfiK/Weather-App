import { useState } from 'react';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { useDebounce } from '../hooks/useDebounce';
import { useCitySearch } from '../../application/hooks/useCitySearch';
import { useTranslation, type Language } from '../../application/i18n/useTranslation';
import type { City } from '../../domain/types';
import { CitySuggestions } from './CitySuggestions';

export function SearchBar({ onSelect }: { onSelect: (city: City) => void }) {
  const { lang, t } = useTranslation();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const { cities, isLoading } = useCitySearch(debounced, lang as Language);

  function handleSelect(city: City) {
    setQuery('');
    onSelect(city);
  }

  return (
    <div className="relative flex-1">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('search.placeholder')}
        aria-label={t('search.placeholder')}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2"><Spinner /></div>
      )}
      {debounced.length >= 3 && (
        <CitySuggestions cities={cities} onSelect={handleSelect} isLoading={isLoading} />
      )}
    </div>
  );
}
