import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('updates value on change', () => {
    render(<Input placeholder="x" />);
    const el = screen.getByPlaceholderText('x') as HTMLInputElement;
    fireEvent.change(el, { target: { value: 'abc' } });
    expect(el.value).toBe('abc');
  });
});
