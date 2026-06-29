import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  APP_LOCALES,
  getLocaleById,
  loadStoredLocaleId,
  saveStoredLocaleId,
  type AppLocale,
  type AppLocaleId,
} from '../data/localeConfig';

interface LocaleContextValue {
  locale: AppLocale;
  locales: AppLocale[];
  setLocaleId: (id: AppLocaleId) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function applyLocaleToDocument(locale: AppLocale) {
  document.documentElement.lang = locale.htmlLang;
  document.documentElement.style.setProperty('--app-font-family', locale.fontFamily);
  document.body.style.fontFamily = locale.fontFamily;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [localeId, setLocaleIdState] = useState<AppLocaleId>(() => loadStoredLocaleId());
  const locale = useMemo(() => getLocaleById(localeId), [localeId]);

  useEffect(() => {
    saveStoredLocaleId(localeId);
    applyLocaleToDocument(locale);
  }, [locale, localeId]);

  const setLocaleId = (id: AppLocaleId) => setLocaleIdState(id);

  const value = useMemo(
    () => ({ locale, locales: APP_LOCALES, setLocaleId }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
