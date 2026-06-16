import { useCallback, useState } from 'react';

export type GeoStatus = 'idle' | 'requesting' | 'success' | 'denied' | 'unavailable';

export interface GeoCoords { lat: number; lon: number; }

export interface GeoState {
  status: GeoStatus;
  coords: GeoCoords | null;
  request: () => void;
}

export function useGeolocation(): GeoState {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [coords, setCoords] = useState<GeoCoords | null>(null);

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      return;
    }
    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setStatus('success');
      },
      (err) => {
        setStatus(err.code === 1 ? 'denied' : 'unavailable');
      },
      { timeout: 10_000 },
    );
  }, []);

  return { status, coords, request };
}
