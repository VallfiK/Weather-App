import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readStorage, writeStorage } from '../../infrastructure/storage/localStorage';
import { I18nProvider, type Language } from '../i18n/useTranslation';

const STORAGE_KEY = 'weather-app:lang:v1';

function detectInitial(): Language {
  const stored = readStorage<{ lang: Language }>(STORAGE_KEY);
  if (stored?.lang === 'ru' || stored?.lang === 'en') return stored.lang;
  const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en';
  return nav.startsWith('ru') ? 'ru' : 'en';
}

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => detectInitial());

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    writeStorage(STORAGE_KEY, { lang: next });
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return (
    <LanguageContext.Provider value={value}>
      <I18nProvider lang={lang} setLang={setLang}>{children}</I18nProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
