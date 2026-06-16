import { useTranslation } from '../../application/i18n/useTranslation';
import type { ApiError } from '../../domain/types';

function message(error: ApiError, t: (k: string, v?: Record<string, string | number>) => string): string {
  switch (error.kind) {
    case 'network': return t('errors.network');
    case 'notFound': return t('errors.notFound');
    case 'rateLimit': return t('errors.rateLimit');
    case 'unauthorized': return t('errors.unauthorized');
    case 'server': return t('errors.server', { status: error.status });
  }
}

export function ErrorBanner({ error }: { error: ApiError }) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">
      {message(error, t)}
    </div>
  );
}
