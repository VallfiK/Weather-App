import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { WeatherIcon } from './WeatherIcon';

describe('WeatherIcon', () => {
  it('renders the right symbol for each code', () => {
    const { container } = render(<WeatherIcon code="clear" />);
    expect(container.textContent).toBe('☀️');
  });
  it('honors size', () => {
    const { container } = render(<WeatherIcon code="rain" size={48} />);
    const span = container.querySelector('span')!;
    expect(span.style.fontSize).toBe('48px');
  });
});
