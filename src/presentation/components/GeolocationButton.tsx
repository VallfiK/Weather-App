import { useEffect } from 'react';
import { IconButton } from '../ui/IconButton';
import { useTranslation } from '../../application/i18n/useTranslation';
import { useGeolocation, type GeoStatus } from '../hooks/useGeolocation';

export function GeolocationButton({
  onResolved,
  onError,
}: {
  onResolved: (coords: { lat: number; lon: number }) => void;
  onError?: (status: GeoStatus) => void;
}) {
  const { t } = useTranslation();
  const geo = useGeolocation();

  useEffect(() => {
    if (geo.status === 'success' && geo.coords) onResolved(geo.coords);
    if (geo.status === 'denied' || geo.status === 'unavailable') onError?.(geo.status);
  }, [geo.status, geo.coords, onResolved, onError]);

  return (
    <IconButton aria-label={t('geolocation.button')} onClick={geo.request}>
      📍
    </IconButton>
  );
}
