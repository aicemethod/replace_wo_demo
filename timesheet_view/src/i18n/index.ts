import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ja from "./locales/ja/translation.json";
import en from "./locales/en/translation.json";

/**
 * Dataverseの言語ID → 言語コード変換
 * 1033: 英語, 1041: 日本語 など
 * 
 * - モデル駆動型アプリの Web リソースでは Xrm は親フレーム(parent)に存在することが多い
 * - Utility.getGlobalContext() の呼び出し可否を安全に確認
 */
const getLanguageFromXrm = (): string => {
    try {
        //  Xrmを安全に取得（親フレーム優先）
        const xrm =
            (window as any).parent?.Xrm ||
            (window as any).Xrm ||
            null;

        if (!xrm) {
            console.warn("Xrm not found — fallback to browser language");
            return navigator.language.startsWith("ja") ? "ja" : "en";
        }

        //  getGlobalContextが関数か確認
        if (typeof xrm.Utility?.getGlobalContext === "function") {
            const context = xrm.Utility.getGlobalContext();
            const langId = context.userSettings?.languageId;

            switch (langId) {
                case 1041:
                    return "ja";
                case 1033:
                    return "en";
                default:
                    console.warn(`Unsupported languageId: ${langId}, fallback to English`);
                    return "en";
            }
        }

        console.warn("getGlobalContext is not available — fallback to browser language");
        return navigator.language.startsWith("ja") ? "ja" : "en";
    } catch (e) {
        console.error("Error getting Xrm language context:", e);
        return navigator.language.startsWith("ja") ? "ja" : "en";
    }
};

/** Dataverse / ローカル環境両対応の言語判定 */
const userLang = getLanguageFromXrm();

// debug
// const userLang = "en";
// debug

i18n
    .use(initReactI18next)
    .init({
        resources: {
            ja: { translation: ja },
            en: { translation: en },
        },
        lng: userLang,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
