import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '../../application/i18n/useTranslation';
import { ErrorBanner } from './ErrorBanner';

describe('ErrorBanner', () => {
  it('renders the localized message for known kinds', () => {
    render(
      <I18nProvider lang="en" setLang={() => {}}>
        <ErrorBanner error={{ kind: 'notFound' }} />
      </I18nProvider>
    );
    expect(screen.getByText(/city not found/i)).toBeInTheDocument();
  });
  it('renders the server message with status', () => {
    render(
      <I18nProvider lang="en" setLang={() => {}}>
        <ErrorBanner error={{ kind: 'server', status: 503 }} />
      </I18nProvider>
    );
    expect(screen.getByText(/503/)).toBeInTheDocument();
  });
});
