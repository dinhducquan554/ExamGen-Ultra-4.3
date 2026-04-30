
import React, { createContext, useEffect, useState, ReactNode, useCallback } from "react";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    // Check for saved theme in localStorage or default to 'light'
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });

  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme);
    // Mock saving preferences to a server
    console.log("Saving theme preference:", { themeMode: newTheme });
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);


  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
