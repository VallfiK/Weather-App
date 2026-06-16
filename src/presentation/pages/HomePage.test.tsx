import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/server';
import { env } from '../../config/env';
import { FavoritesProvider } from '../../application/context/FavoritesContext';
import { LanguageProvider } from '../../application/context/LanguageContext';
import { ThemeProvider } from '../../application/context/ThemeContext';
import { makeWrapper } from '../../test/utils';
import { HomePage } from './HomePage';

function AllProviders({ children }: { children: React.ReactNode }) {
  const Wrapper = makeWrapper();
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <Wrapper>{children}</Wrapper>
        </FavoritesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('renders current temperature for the default city', async () => {
    server.use(
      http.get(`${env.baseUrl}/data/2.5/weather`, () => HttpResponse.json({
        main: { temp: 10, feels_like: 8, humidity: 50, pressure: 1000 },
        weather: [{ id: 800, main: 'Clear', description: 'clear' }],
        wind: { speed: 1, deg: 0 },
        dt: 1718450000, sys: { sunrise: 1718420000, sunset: 1718480000 },
      })),
      http.get(`${env.baseUrl}/data/2.5/forecast`, () => HttpResponse.json({ list: [] })),
    );
    render(<HomePage />, { wrapper: AllProviders });
    await waitFor(() => expect(screen.getByText('10°')).toBeInTheDocument());
  });
});
