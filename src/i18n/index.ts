import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE_ID, loadStoredLocaleId } from '../data/localeConfig';
import en from './locales/en/common.json';
import zh from './locales/zh/common.json';
import vi from './locales/vi/common.json';
import ms from './locales/ms/common.json';
import es from './locales/es/common.json';
import fr from './locales/fr/common.json';
import ja from './locales/ja/common.json';
import ko from './locales/ko/common.json';

void i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
    zh: { common: zh },
    vi: { common: vi },
    ms: { common: ms },
    es: { common: es },
    fr: { common: fr },
    ja: { common: ja },
    ko: { common: ko },
  },
  lng: loadStoredLocaleId(),
  fallbackLng: DEFAULT_LOCALE_ID,
  defaultNS: 'common',
  ns: ['common'],
  interpolation: { escapeValue: false },
});

export default i18n;
