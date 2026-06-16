import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageContext';

function Probe() {
  const { lang, setLang } = useLanguage();
  return (
    <>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang('en')}>to-en</button>
      <button onClick={() => setLang('ru')}>to-ru</button>
    </>
  );
}

describe('LanguageContext', () => {
  it('defaults to en when navigator is en', () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId('lang').textContent).toBe('en');
  });

  it('setLang persists to localStorage', () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    fireEvent.click(screen.getByText('to-ru'));
    expect(screen.getByTestId('lang').textContent).toBe('ru');
    expect(localStorage.getItem('weather-app:lang:v1')).toBe(JSON.stringify({ lang: 'ru' }));
  });
});
