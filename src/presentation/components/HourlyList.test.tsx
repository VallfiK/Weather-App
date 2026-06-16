import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HourlyList } from './HourlyList';

describe('HourlyList', () => {
  it('renders each hour with temp', () => {
    const points = [
      { time: new Date('2026-06-15T15:00:00'), temp: 18, condition: 'clear' as const },
      { time: new Date('2026-06-15T18:00:00'), temp: 16, condition: 'cloudy' as const },
    ];
    render(<HourlyList points={points} />);
    expect(screen.getByText('18°')).toBeInTheDocument();
    expect(screen.getByText('16°')).toBeInTheDocument();
  });
});
