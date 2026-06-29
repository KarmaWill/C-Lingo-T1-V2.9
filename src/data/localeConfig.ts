export type AppLocaleId = 'zh' | 'en' | 'vi' | 'ms';

export interface AppLocale {
  id: AppLocaleId;
  name: string;
  flag: string;
  label: string;
  fontFamily: string;
  htmlLang: string;
}

export const APP_LOCALES: AppLocale[] = [
  {
    id: 'zh',
    name: '中文',
    flag: '🇨🇳',
    label: 'CN',
    fontFamily: '"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    htmlLang: 'zh-CN',
  },
  {
    id: 'en',
    name: 'English',
    flag: '🇺🇸',
    label: 'EN',
    fontFamily: '"Google Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    htmlLang: 'en',
  },
  {
    id: 'vi',
    name: 'Tiếng Việt',
    flag: '🇻🇳',
    label: 'VI',
    fontFamily: '"Be Vietnam Pro", "Noto Sans", sans-serif',
    htmlLang: 'vi',
  },
  {
    id: 'ms',
    name: 'Bahasa Melayu',
    flag: '🇲🇾',
    label: 'MS',
    fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif',
    htmlLang: 'ms',
  },
];

export const DEFAULT_LOCALE_ID: AppLocaleId = 'en';
const STORAGE_KEY = 'c-lingo-ui-locale-v1';

export function getLocaleById(id: AppLocaleId): AppLocale {
  return APP_LOCALES.find((locale) => locale.id === id) ?? APP_LOCALES.find((l) => l.id === DEFAULT_LOCALE_ID)!;
}

export function loadStoredLocaleId(): AppLocaleId {
  if (typeof window === 'undefined') return DEFAULT_LOCALE_ID;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && APP_LOCALES.some((l) => l.id === raw)) return raw as AppLocaleId;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE_ID;
}

export function saveStoredLocaleId(id: AppLocaleId) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, id);
  }
}
