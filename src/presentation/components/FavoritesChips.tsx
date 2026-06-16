import { useFavorites } from '../../application/context/FavoritesContext';
import { FavoriteChip } from './FavoriteChip';

export function FavoritesChips() {
  const { cities, selectedId, select, remove } = useFavorites();
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" data-testid="favorites-chips">
      {cities.map((c) => (
        <FavoriteChip
          key={c.id}
          label={c.name}
          selected={c.id === selectedId}
          onClick={() => select(c.id)}
          onRemove={() => remove(c.id)}
        />
      ))}
    </div>
  );
}
