import { useTheme } from '../../application/context/ThemeContext';
import { useLanguage } from '../../application/context/LanguageContext';
import { useTranslation } from '../../application/i18n/useTranslation';
import type { ReactNode } from 'react';
import type { Theme } from '../../application/context/ThemeContext';

const THEME_ORDER: Theme[] = ['light', 'dark', 'auto'];

export function AppLayout({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-4 p-4">
      <header className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-lg font-semibold">{t('app.title')}</h1>

        <div role="group" aria-label={t('theme.label')} className="flex overflow-hidden rounded-full bg-surface text-sm">
          {THEME_ORDER.map((th) => (
            <button
              key={th}
              onClick={() => setTheme(th)}
              aria-pressed={theme === th}
              className={`px-3 py-1 ${theme === th ? 'bg-accent text-white' : 'text-muted'}`}
            >
              {t(`theme.${th}` as const)}
            </button>
          ))}
        </div>

        <div role="group" aria-label={t('language.label')} className="flex overflow-hidden rounded-full bg-surface text-sm">
          {(['ru', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`px-3 py-1 ${lang === l ? 'bg-accent text-white' : 'text-muted'}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4">{children}</main>
    </div>
  );
}
