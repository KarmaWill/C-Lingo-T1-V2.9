import {
  APP_FONT_FAMILY,
  APP_FONT_JA,
  APP_FONT_KO,
} from '../theme/appFont'

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
    fontFamily: APP_FONT_FAMILY,
    htmlLang: 'zh-CN',
  },
  {
    id: 'en',
    name: 'English',
    flag: '🇺🇸',
    label: 'EN',
    fontFamily: APP_FONT_FAMILY,
    htmlLang: 'en',
  },
  {
    id: 'vi',
    name: 'Tiếng Việt',
    flag: '🇻🇳',
    label: 'VI',
    fontFamily: APP_FONT_FAMILY,
    htmlLang: 'vi',
  },
  {
    id: 'ms',
    name: 'Bahasa Melayu',
    flag: '🇲🇾',
    label: 'MS',
    fontFamily: APP_FONT_FAMILY,
    htmlLang: 'ms',
  },
  {
    id: 'es',
    name: 'Español',
    flag: '🇪🇸',
    label: 'ES',
    fontFamily: APP_FONT_FAMILY,
    htmlLang: 'es',
  },
  {
    id: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    label: 'FR',
    fontFamily: APP_FONT_FAMILY,
    htmlLang: 'fr',
  },
  {
    id: 'ja',
    name: '日本語',
    flag: '🇯🇵',
    label: 'JA',
    fontFamily: APP_FONT_JA,
    htmlLang: 'ja',
  },
  {
    id: 'ko',
    name: '한국어',
    flag: '🇰🇷',
    label: 'KO',
    fontFamily: APP_FONT_KO,
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
