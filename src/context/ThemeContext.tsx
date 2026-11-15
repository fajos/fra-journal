import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme, ThemeKey, THEMES } from '../constants/theme';
import { hapticFeedback } from '../services/hapticsService';

const THEME_STORAGE_KEY = '@ejournal_theme_key';

interface ThemeContextType {
  theme: AppTheme;
  themeKey: ThemeKey;
  setThemeKey: (key: ThemeKey) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES.warmPaper,
  themeKey: 'warmPaper',
  setThemeKey: () => {},
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeKey, setThemeKeyState] = useState<ThemeKey>('warmPaper');

  useEffect(() => {
    async function loadThemePref() {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && (saved in THEMES)) {
          setThemeKeyState(saved as ThemeKey);
        }
      } catch (e) {
        console.warn('Failed to load theme preference:', e);
      }
    }
    loadThemePref();
  }, []);

  const setThemeKey = async (key: ThemeKey) => {
    hapticFeedback.selection();
    setThemeKeyState(key);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, key);
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  };

  const theme = THEMES[themeKey] || THEMES.warmPaper;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeKey,
        setThemeKey,
        isDark: theme.isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
