import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

function Probe() {
  const { theme, setTheme, resolved } = useTheme();
  return (
    <>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolved}</span>
      <button onClick={() => setTheme('dark')}>dark</button>
      <button onClick={() => setTheme('light')}>light</button>
      <button onClick={() => setTheme('auto')}>auto</button>
    </>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('applies data-theme to <html> on change', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    fireEvent.click(screen.getByText('dark'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    fireEvent.click(screen.getByText('light'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('persists choice to localStorage', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    fireEvent.click(screen.getByText('dark'));
    expect(localStorage.getItem('weather-app:theme:v1')).toBe(JSON.stringify({ theme: 'dark' }));
  });
});
