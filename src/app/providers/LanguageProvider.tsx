import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { Language } from '../../types';

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'fieldo:language';

function readInitialLanguage(): Language {
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
  return raw === 'en' || raw === 'es' ? raw : 'es';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => readInitialLanguage());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore
    }

    document.documentElement.lang = language === 'es' ? 'es-MX' : 'en';
    window.dispatchEvent(new CustomEvent('fieldo:language', { detail: { language } }));
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      setLanguage,
      toggleLanguage: () => setLanguage((l) => (l === 'en' ? 'es' : 'en')),
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

