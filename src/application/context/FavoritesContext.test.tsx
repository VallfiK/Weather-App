import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FavoritesProvider, useFavorites } from './FavoritesContext';

const moscow = { id: 'Moscow,RU,55.75,37.62', name: 'Moscow', country: 'RU', lat: 55.75, lon: 37.62 };
const london = { id: 'London,GB,51.51,-0.13', name: 'London', country: 'GB', lat: 51.51, lon: -0.13 };

function Probe() {
  const f = useFavorites();
  return (
    <>
      <span data-testid="cities">{f.cities.length}</span>
      <span data-testid="selected">{f.selectedId ?? 'none'}</span>
      <button onClick={() => f.add(moscow)}>add-m</button>
      <button onClick={() => f.add(london)}>add-l</button>
      <button onClick={() => f.select(moscow.id)}>sel-m</button>
      <button onClick={() => f.remove(london.id)}>rem-l</button>
    </>
  );
}

describe('FavoritesContext', () => {
  it('seeds with Moscow when nothing is stored', () => {
    render(<FavoritesProvider><Probe /></FavoritesProvider>);
    expect(screen.getByTestId('cities').textContent).toBe('1');
    expect(screen.getByTestId('selected').textContent).toBe(moscow.id);
  });

  it('add and select work, persist to localStorage', () => {
    render(<FavoritesProvider><Probe /></FavoritesProvider>);
    fireEvent.click(screen.getByText('add-l'));
    fireEvent.click(screen.getByText('sel-m'));
    expect(screen.getByTestId('cities').textContent).toBe('2');
    const stored = JSON.parse(localStorage.getItem('weather-app:favorites:v1')!);
    expect(stored.cities).toContainEqual(moscow);
    expect(stored.cities).toContainEqual(london);
    expect(stored.selectedId).toBe(moscow.id);
  });

  it('remove deletes city from list', () => {
    render(<FavoritesProvider><Probe /></FavoritesProvider>);
    fireEvent.click(screen.getByText('add-l'));
    fireEvent.click(screen.getByText('rem-l'));
    expect(screen.getByTestId('cities').textContent).toBe('1');
  });
});
