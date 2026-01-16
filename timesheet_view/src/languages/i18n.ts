import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import jaTranslation from './japanese/translation.json';
import enTranslation from './english/translation.json';

/**
 * Dataverseの言語ID → 言語コード変換
 * 1033: 英語, 1041: 日本語 など
 */
const getLanguageFromXrm = (): string => {
  try {
    const xrm =
      (window as any).parent?.Xrm ||
      (window as any).Xrm ||
      null;

    if (!xrm) {
      console.warn('Xrmが見つかりません — ブラウザの言語設定を使用します');
      return navigator.language.startsWith('ja') ? 'ja' : 'en';
    }

    if (typeof xrm.Utility?.getGlobalContext === 'function') {
      const context = xrm.Utility.getGlobalContext();
      const langId = context.userSettings?.languageId;

      switch (langId) {
        case 1041:
          return 'ja';
        case 1033:
          return 'en';
        default:
          console.warn(`サポートされていない言語ID: ${langId}, 英語にフォールバックします`);
          return 'en';
      }
    }

    console.warn('getGlobalContextが利用できません — ブラウザの言語設定を使用します');
    return navigator.language.startsWith('ja') ? 'ja' : 'en';
  } catch (e) {
    console.error('Xrm言語コンテキストの取得エラー:', e);
    return navigator.language.startsWith('ja') ? 'ja' : 'en';
  }
};

const detectedLanguage = getLanguageFromXrm();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ja: {
        translation: jaTranslation,
      },
      en: {
        translation: enTranslation,
      },
    },
    lng: detectedLanguage,
    fallbackLng: 'ja',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

