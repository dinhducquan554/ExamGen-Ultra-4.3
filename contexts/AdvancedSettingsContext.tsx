import React, { createContext, useState, ReactNode } from 'react';

// Define a comprehensive interface for all settings
export interface AdvancedSettings {
  // General
  language: 'vi' | 'en';
  fontSize: number;
  enableNotifications: boolean;
  // Data
  defaultSavePath: string;
  autoSave: boolean;
  autoSaveInterval: number; // in minutes
  // Security
  enable2FA: boolean;
  // AI
  aiAssistant: boolean;
  automationLevel: 'manual' | 'suggested' | 'full';
  aiModel: 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-3.8-flash' | 'gpt-4' | 'claude-3' | string;
  aiLanguage: 'vi' | 'en';
  // Publishing
  defaultTemplate: string;
  paperSize: 'A4' | 'Letter';
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  enableLogo: boolean;
  logoUrl: string;
  headerText: string;
  enableWatermark: boolean;
  watermarkText: string;
  fileNameConvention: string;
  // Connections
  offlineMode: boolean;
  driveConnected: boolean;
  oneDriveConnected: boolean;
  autoUpdate: boolean;
  // Advanced
  defaultMatrix: 'cv7991' | 'nguvan';
  enableMathJax: boolean;
  editorFontFamily: 'times' | 'arial' | 'calibri';
  editorLineSpacing: number;
}

const defaultAdvancedSettings: AdvancedSettings = {
  language: 'vi',
  fontSize: 100,
  enableNotifications: true,
  defaultSavePath: 'C:\\Users\\Admin\\Downloads',
  autoSave: true,
  autoSaveInterval: 5,
  enable2FA: false,
  aiAssistant: true,
  automationLevel: 'suggested',
  aiModel: 'gemini-2.5-flash',
  aiLanguage: 'vi',
  defaultTemplate: 'Mẫu chuẩn Bộ GD&ĐT',
  paperSize: 'A4',
  marginLeft: 2,
  marginRight: 2,
  marginTop: 2,
  marginBottom: 2,
  enableLogo: false,
  logoUrl: '',
  headerText: 'TRƯỜNG THPT CHUYÊN LÊ KHIẾT',
  enableWatermark: false,
  watermarkText: 'Bản nháp',
  fileNameConvention: '{lop}_{mon}_{kieu_de}_{ma_de}',
  offlineMode: false,
  driveConnected: false,
  oneDriveConnected: false,
  autoUpdate: true,
  defaultMatrix: 'cv7991',
  enableMathJax: true,
  editorFontFamily: 'times',
  editorLineSpacing: 1.15,
};

const STORAGE_KEY = 'form_advanced_settings';

interface AdvancedSettingsContextType {
  advSettings: AdvancedSettings;
  setAdvSettings: (updates: Partial<AdvancedSettings>) => void;
  resetAdvSettings: () => void;
}

export const AdvancedSettingsContext = createContext<AdvancedSettingsContextType | null>(null);

export const AdvancedSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [advSettings, setAdvSettingsState] = useState<AdvancedSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultAdvancedSettings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error parsing advanced settings from localStorage', error);
    }
    return defaultAdvancedSettings;
  });

  const setAdvSettings = (updates: Partial<AdvancedSettings>) => {
    const newSettings = { ...advSettings, ...updates };
    setAdvSettingsState(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving advanced settings to localStorage', error);
    }
  };

  const resetAdvSettings = () => {
    setAdvSettingsState(defaultAdvancedSettings);
    localStorage.removeItem(STORAGE_KEY);
  };
  
  return (
    <AdvancedSettingsContext.Provider value={{ advSettings, setAdvSettings, resetAdvSettings }}>
      {children}
    </AdvancedSettingsContext.Provider>
  );
};