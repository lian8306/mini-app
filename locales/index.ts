import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import enUs from "./en-us.json";
import zhCn from "./zh-cn.json";

i18n.use(LanguageDetector)
    .use(initReactI18next) // bind react-i18next to the instance
    .init({
        fallbackLng: 'zh',
        debug: true,
        resources: {
            'en': {
                translation: enUs,
            },
            'zh': {
                translation: zhCn,
            },
        },

        interpolation: {
            escapeValue: false // not needed for react!!
        }
    });

export default i18n;
