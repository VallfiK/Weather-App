import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '../../application/i18n/useTranslation';
import { FavoriteChip } from './FavoriteChip';

describe('FavoriteChip', () => {
  it('shows active state when selected', () => {
    render(
      <I18nProvider lang="en" setLang={() => {}}>
        <FavoriteChip label="Москва" selected onClick={() => {}} onRemove={() => {}} />
      </I18nProvider>
    );
    expect(screen.getByText('Москва').parentElement?.className).toMatch(/bg-accent/);
  });
  it('fires onClick and onRemove', () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <I18nProvider lang="en" setLang={() => {}}>
        <FavoriteChip label="X" selected={false} onClick={onClick} onRemove={onRemove} />
      </I18nProvider>
    );
    fireEvent.click(screen.getByText('X'));
    expect(onClick).toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText(/remove/i));
    expect(onRemove).toHaveBeenCalled();
  });
});
