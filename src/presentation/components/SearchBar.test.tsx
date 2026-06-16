import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/server';
import { makeWrapper } from '../../test/utils';
import { I18nProvider } from '../../application/i18n/useTranslation';
import { env } from '../../config/env';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('shows suggestions after debounce when typing 3+ chars', async () => {
    server.use(
      http.get(`${env.baseUrl}/geo/1.0/direct`, () => HttpResponse.json([
        { name: 'Moscow', country: 'RU', lat: 55.75, lon: 37.62 },
      ])),
    );
    const onSelect = vi.fn();
    render(
      <I18nProvider lang="en" setLang={() => {}}>
        <SearchBar onSelect={onSelect} />
      </I18nProvider>,
      { wrapper: makeWrapper() }
    );
    const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Moscow' } });
    await waitFor(() => expect(screen.getByText('Moscow')).toBeInTheDocument(), { timeout: 2000 });
    fireEvent.click(screen.getByText('Moscow'));
    expect(onSelect).toHaveBeenCalled();
    await waitFor(() => {
      expect(input.value).toBe('');
      expect(screen.queryByText('Moscow')).not.toBeInTheDocument();
    });
  });
});
