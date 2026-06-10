import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
import enCommon from './locales/en/common.json';
import enNav from './locales/en/navigation.json';
import enAuth from './locales/en/auth.json';
import enAbout from './locales/en/about.json';
import enForms from './locales/en/forms.json';
import enDashboard from './locales/en/dashboard.json';
import enFaqs from './locales/en/faqs.json';
import enKnowledge from './locales/en/knowledge.json';
import enEvents from './locales/en/events.json';
import enNews from './locales/en/news.json';
import enLearning from './locales/en/learning.json';
import enSocieties from './locales/en/societies.json';

import frCommon from './locales/fr/common.json';
import frNav from './locales/fr/navigation.json';
import frAuth from './locales/fr/auth.json';
import frAbout from './locales/fr/about.json';
import frForms from './locales/fr/forms.json';
import frDashboard from './locales/fr/dashboard.json';
import frFaqs from './locales/fr/faqs.json';
import frKnowledge from './locales/fr/knowledge.json';
import frEvents from './locales/fr/events.json';
import frNews from './locales/fr/news.json';
import frLearning from './locales/fr/learning.json';
import frSocieties from './locales/fr/societies.json';

import ptCommon from './locales/pt/common.json';
import ptNav from './locales/pt/navigation.json';
import ptAuth from './locales/pt/auth.json';
import ptAbout from './locales/pt/about.json';
import ptForms from './locales/pt/forms.json';
import ptDashboard from './locales/pt/dashboard.json';
import ptFaqs from './locales/pt/faqs.json';
import ptKnowledge from './locales/pt/knowledge.json';
import ptEvents from './locales/pt/events.json';
import ptNews from './locales/pt/news.json';
import ptLearning from './locales/pt/learning.json';
import ptSocieties from './locales/pt/societies.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        navigation: enNav,
        auth: enAuth,
        about: enAbout,
        forms: enForms,
        dashboard: enDashboard,
        faqs: enFaqs,
        knowledge: enKnowledge,
        events: enEvents,
        news: enNews,
        learning: enLearning,
        societies: enSocieties,
      },
      fr: {
        common: frCommon,
        navigation: frNav,
        auth: frAuth,
        about: frAbout,
        forms: frForms,
        dashboard: frDashboard,
        faqs: frFaqs,
        knowledge: frKnowledge,
        events: frEvents,
        news: frNews,
        learning: frLearning,
        societies: frSocieties,
      },
      pt: {
        common: ptCommon,
        navigation: ptNav,
        auth: ptAuth,
        about: ptAbout,
        forms: ptForms,
        dashboard: ptDashboard,
        faqs: ptFaqs,
        knowledge: ptKnowledge,
        events: ptEvents,
        news: ptNews,
        learning: ptLearning,
        societies: ptSocieties,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'navigation', 'auth', 'about', 'forms', 'dashboard', 'faqs', 'knowledge', 'events', 'news', 'learning', 'societies'],
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
