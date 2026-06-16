import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider, useTranslation } from './useTranslation';

function Probe({ k, v }: { k: string; v?: Record<string, string | number> }) {
  const { t } = useTranslation();
  return <span>{t(k, v)}</span>;
}

describe('useTranslation', () => {
  it('translates a known key in RU', () => {
    render(<I18nProvider lang="ru" setLang={() => {}}><Probe k="search.placeholder" /></I18nProvider>);
    expect(screen.getByText('Введите город…')).toBeInTheDocument();
  });
  it('translates a known key in EN', () => {
    render(<I18nProvider lang="en" setLang={() => {}}><Probe k="search.placeholder" /></I18nProvider>);
    expect(screen.getByText('Search city…')).toBeInTheDocument();
  });
  it('interpolates variables', () => {
    render(<I18nProvider lang="en" setLang={() => {}}><Probe k="weather.feelsLike" v={{ temp: 5 }} /></I18nProvider>);
    expect(screen.getByText('Feels like 5°')).toBeInTheDocument();
  });
  it('returns the key for unknown paths', () => {
    render(<I18nProvider lang="en" setLang={() => {}}><Probe k="does.not.exist" /></I18nProvider>);
    expect(screen.getByText('does.not.exist')).toBeInTheDocument();
  });
});
