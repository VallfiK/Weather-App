import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('a', 200));
    expect(result.current).toBe('a');
  });

  it('updates after the delay', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 200), { initialProps: { v: 'a' } });
    rerender({ v: 'b' });
    expect(result.current).toBe('a');
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('b');
    vi.useRealTimers();
  });
});
