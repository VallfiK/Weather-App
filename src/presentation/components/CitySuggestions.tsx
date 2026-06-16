import type { City } from '../../domain/types';
import { useTranslation } from '../../application/i18n/useTranslation';

export function CitySuggestions({ cities, onSelect, isLoading }: {
  cities: City[];
  onSelect: (city: City) => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  if (!isLoading && cities.length === 0) return null;
  return (
    <ul role="listbox" className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-muted/30 bg-surface shadow-lg">
      {cities.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            role="option"
            aria-selected="false"
            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-bg/50"
            onClick={() => onSelect(c)}
          >
            <span>{c.name}</span>
            <span className="text-xs text-muted">{c.country}</span>
          </button>
        </li>
      ))}
      {isLoading && (
        <li className="px-4 py-2 text-xs text-muted">{t('app.title')}…</li>
      )}
    </ul>
  );
}
