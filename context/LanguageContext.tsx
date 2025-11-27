import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from '../utils/i18n';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(i18n.locale);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const storedLang = await AsyncStorage.getItem('user-language');
      if (storedLang) {
        i18n.locale = storedLang;
        setLanguageState(storedLang);
      } else {
        // Fallback handled by utils/i18n.ts usually, but ensure sync
        setLanguageState(i18n.locale);
      }
    } catch (e) {
      console.error('Failed to load language', e);
    } finally {
      setIsReady(true);
    }
  };

  const setLanguage = async (newLang: string) => {
    i18n.locale = newLang;
    setLanguageState(newLang);
    await AsyncStorage.setItem('user-language', newLang);
  };

  if (!isReady) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
