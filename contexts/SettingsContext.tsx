import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '../hooks/useToast';

export interface AppSettings {
  year: string;
  province: string;
  school: string;
  signPlace: string;
  signer: string;
  groupLeader: string;
  teacher: string;
  schoolLevel: string;
  profGroup: string;
  grade: string;
  subject: string;
  textbook: string;
  examType: string;
  duration: string;
  scale: string;
}

const defaultSettings: AppSettings = {
  year: `${new Date().getFullYear()}–${new Date().getFullYear() + 1}`,
  province: '',
  school: '',
  signPlace: '',
  signer: '',
  groupLeader: '',
  teacher: '',
  schoolLevel: '',
  profGroup: '',
  grade: '',
  subject: '',
  textbook: '',
  examType: '',
  duration: '45',
  scale: '10',
};

const STORAGE_KEY = 'form_general_settings';

interface SettingsContextType {
  settings: AppSettings;
  saveSettings: (newSettings: AppSettings) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addToast } = useToast();

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Error parsing settings from localStorage', error);
    }
    return defaultSettings;
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      addToast("Đã khôi phục dữ liệu Thiết lập chung.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings to localStorage', error);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
    addToast("Đã xóa dữ liệu Thiết lập chung.");
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
