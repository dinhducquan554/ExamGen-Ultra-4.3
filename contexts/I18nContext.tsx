import React, { createContext, ReactNode, useCallback } from 'react';
import { useAdvancedSettings } from '../hooks/useAdvancedSettings';
import { vi } from '../locales/vi';
import { en } from '../locales/en';

const translations = { vi, en };

// This type helps with autocomplete, but we will use 'any' in components for simplicity
// as creating a perfect key type can be complex.
type TranslationKey = keyof typeof vi;

// Define a type for interpolation values
type InterpolationValues = { [key: string]: string | number };

interface I18nContextType {
  t: (key: TranslationKey | string, fallback?: string, values?: InterpolationValues) => string;
  language: 'vi' | 'en';
}

export const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { advSettings } = useAdvancedSettings();
  const language = advSettings.language;

  const t = useCallback((key: TranslationKey | string, fallback?: string, values?: InterpolationValues): string => {
    const langDict = translations[language];
    // @ts-ignore - We allow dynamic keys
    let translation = langDict[key] || fallback || key;

    if (values) {
      Object.keys(values).forEach(valueKey => {
        const regex = new RegExp(`{${valueKey}}`, 'g');
        translation = translation.replace(regex, String(values[valueKey]));
      });
    }

    return translation;
  }, [language]);

  return (
    <I18nContext.Provider value={{ t, language }}>
      {children}
    </I18nContext.Provider>
  );
};
