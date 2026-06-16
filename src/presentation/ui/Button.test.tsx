import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders and fires click', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByText('Go'));
    expect(onClick).toHaveBeenCalled();
  });
  it('is disabled when prop set', () => {
    render(<Button disabled>X</Button>);
    expect(screen.getByText('X')).toBeDisabled();
  });
});
