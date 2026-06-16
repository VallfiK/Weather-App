import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from './useGeolocation';

const mockGet = vi.fn();

beforeEach(() => {
  mockGet.mockReset();
  (globalThis as unknown as { navigator: { geolocation: { getCurrentPosition: typeof mockGet } } }).navigator = {
    geolocation: { getCurrentPosition: mockGet },
  };
});

describe('useGeolocation', () => {
  it('starts idle', () => {
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.status).toBe('idle');
  });

  it('resolves with coords on success', () => {
    mockGet.mockImplementation((success: PositionCallback) => {
      success({ coords: { latitude: 1, longitude: 2 } } as GeolocationPosition);
    });
    const { result } = renderHook(() => useGeolocation());
    act(() => { result.current.request(); });
    expect(result.current.status).toBe('success');
    expect(result.current.coords).toEqual({ lat: 1, lon: 2 });
  });

  it('captures denied state', () => {
    mockGet.mockImplementation((_s: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 1, message: 'denied' } as GeolocationPositionError);
    });
    const { result } = renderHook(() => useGeolocation());
    act(() => { result.current.request(); });
    expect(result.current.status).toBe('denied');
  });
});
