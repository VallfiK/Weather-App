import { useTranslation } from '../../application/i18n/useTranslation';

export function FavoriteChip({
  label,
  selected,
  onClick,
  onRemove,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const base = 'flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition';
  const styles = selected
    ? 'bg-accent text-white'
    : 'bg-bg/40 text-text hover:bg-bg/60';
  return (
    <span className={`${base} ${styles}`}>
      <button type="button" onClick={onClick} className="flex items-center gap-1">
        {selected && <span aria-hidden>📍</span>}
        {label}
      </button>
      <button
        type="button"
        aria-label={t('favorites.remove')}
        onClick={onRemove}
        className="opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </span>
  );
}
