import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Metric } from './Metric';

describe('Metric', () => {
  it('renders label and value', () => {
    render(<Metric icon="💧" label="Humidity" value="62%" />);
    expect(screen.getByText('Humidity')).toBeInTheDocument();
    expect(screen.getByText('62%')).toBeInTheDocument();
  });
});
