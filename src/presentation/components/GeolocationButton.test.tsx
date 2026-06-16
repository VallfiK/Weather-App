import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '../../application/i18n/useTranslation';
import { GeolocationButton } from './GeolocationButton';

const mockGet = vi.fn();
beforeEach(() => {
  mockGet.mockReset();
  (navigator as unknown as { geolocation: { getCurrentPosition: typeof mockGet } }).geolocation = {
    getCurrentPosition: mockGet,
  };
});

describe('GeolocationButton', () => {
  it('calls onResolved with coords on success', () => {
    mockGet.mockImplementation((s: PositionCallback) => s({ coords: { latitude: 1, longitude: 2 } } as GeolocationPosition));
    const onResolved = vi.fn();
    render(
      <I18nProvider lang="en" setLang={() => {}}>
        <GeolocationButton onResolved={onResolved} />
      </I18nProvider>
    );
    fireEvent.click(screen.getByLabelText(/weather nearby/i));
    expect(onResolved).toHaveBeenCalledWith({ lat: 1, lon: 2 });
  });

  it('calls onError when denied', () => {
    mockGet.mockImplementation((_s: PositionCallback, e: PositionErrorCallback) => e({ code: 1 } as GeolocationPositionError));
    const onError = vi.fn();
    render(
      <I18nProvider lang="en" setLang={() => {}}>
        <GeolocationButton onResolved={() => {}} onError={onError} />
      </I18nProvider>
    );
    fireEvent.click(screen.getByLabelText(/weather nearby/i));
    expect(onError).toHaveBeenCalledWith('denied');
  });
});
