// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const languageDetectorInstance = new LanguageDetector();

// Map domains to their default languages
const domainLocaleMap = {
    'drubble.uk': 'en',
    'woordrafel.nl': 'nl',
    'scramair.cymru': 'cy',
    'www.scramair.cymru': 'cy',
};

// --- Custom Detector for all language detection logic ---
const customSuperDetector = {
    name: 'customSuperDetector',
    type: 'languageDetector',
    lookup(options) {
        const host = window.location.hostname;
        const navLang = navigator.language || navigator.userLanguage;

        console.info("Custom Super Detector: Starting lookup...");

        let storedLang = null;
        try {
            if (localStorage.getItem('i18nextLng')) {
                storedLang = localStorage.getItem('i18nextLng');
            } else {
                // Ensure precise cookie matching with '='
                const cookieMatch = document.cookie.split('; ').find(row => row.startsWith('i18nextLng='));
                if (cookieMatch) {
                    storedLang = cookieMatch.split('=')[1];
                }
            }
        } catch (e) {
            console.warn("Custom Super Detector: Failed to read from storage", e);
        }

        if (storedLang) {
            let actualStoredLang = storedLang.toLowerCase();
            if (actualStoredLang === 'en-gb') {
                return 'en';
            } else {
                return storedLang;
            }
        } else {
            console.info('Custom Super Detector: No valid stored language found.');
        }

        const domainLang = domainLocaleMap[host];
        if (domainLang) {
            return domainLang;
        } else {
            console.info('Custom Super Detector: No domain-specific language found.');
        }

        if (navLang) {
            let detectedNavLang = navLang.toLowerCase();
            if (detectedNavLang === 'en-gb') {
                detectedNavLang = 'en';
                return detectedNavLang;
            }
            return detectedNavLang;
        } else {
            console.info('Custom Super Detector: No navigator language found.');
        }

        console.info('Custom Super Detector: No language detected by any method. Falling back to i18n fallbackLng.');
        return undefined;
    },
};

languageDetectorInstance.addDetector(customSuperDetector);

// --- i18next initialization ---
i18n
    .use(Backend) // Usually Backend is first if loading translations from server
    .use(languageDetectorInstance) // <--- CRITICAL: ONLY LanguageDetector here for detection.
    .use(initReactI18next) // initReactI18next is for React integration, often last
    .init({
        fallbackLng: process.env.REACT_APP_DEFAULT_LANG || 'en',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['customSuperDetector', 'localStorage', 'cookie'],

            caches: ['localStorage', 'cookie'],
            lookupLocalStorage: 'i18nextLng',
            lookupCookie: 'i18nextLng',
            cookieSecure: true,

            addDetectors: [customSuperDetector],
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },
        react: {
            useSuspense: true,
            bindI18n: 'languageChanged loaded',
            bindStore: 'added removed',
        },
    });

export default i18n;