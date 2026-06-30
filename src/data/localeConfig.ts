export type AppLocaleId = 'zh' | 'en' | 'vi' | 'ms' | 'es' | 'fr' | 'ja' | 'ko';

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
  {
    id: 'es',
    name: 'Español',
    flag: '🇪🇸',
    label: 'ES',
    fontFamily: '"Google Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    htmlLang: 'es',
  },
  {
    id: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    label: 'FR',
    fontFamily: '"Google Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    htmlLang: 'fr',
  },
  {
    id: 'ja',
    name: '日本語',
    flag: '🇯🇵',
    label: 'JA',
    fontFamily: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
    htmlLang: 'ja',
  },
  {
    id: 'ko',
    name: '한국어',
    flag: '🇰🇷',
    label: 'KO',
    fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
    htmlLang: 'ko',
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

/** Build a full locale map; new languages fall back to English when omitted. */
export function localeRecord(base: {
  en: string;
  zh?: string;
  vi?: string;
  ms?: string;
  es?: string;
  fr?: string;
  ja?: string;
  ko?: string;
}): Record<AppLocaleId, string> {
  const { en } = base;
  return {
    en,
    zh: base.zh ?? en,
    vi: base.vi ?? en,
    ms: base.ms ?? en,
    es: base.es ?? en,
    fr: base.fr ?? en,
    ja: base.ja ?? en,
    ko: base.ko ?? en,
  };
}
