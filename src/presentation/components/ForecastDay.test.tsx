import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ForecastDay } from './ForecastDay';

describe('ForecastDay', () => {
  it('renders min and max with icon and weekday', () => {
    const date = new Date('2026-06-16T00:00:00');
    render(<ForecastDay date={date} min={10} max={20} condition="clear" weekday="Tue" />);
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText(/20°/)).toBeInTheDocument();
    expect(screen.getByText(/10°/)).toBeInTheDocument();
  });
});
