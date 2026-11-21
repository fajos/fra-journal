import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppTheme,
  ThemeKey,
  THEMES,
  FontSizeKey,
  FONT_SIZE_OPTIONS,
  FontSizeOption,
} from '../constants/theme';
import { hapticFeedback } from '../services/hapticsService';

const THEME_STORAGE_KEY = '@ejournal_theme_key';
const FONT_SIZE_STORAGE_KEY = '@ejournal_font_size_key';

interface ThemeContextType {
  theme: AppTheme;
  themeKey: ThemeKey;
  setThemeKey: (key: ThemeKey) => void;
  isDark: boolean;
  fontSizeKey: FontSizeKey;
  fontScale: number;
  setFontSizeKey: (key: FontSizeKey) => void;
  fontSizeOptions: Record<FontSizeKey, FontSizeOption>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES.pureLight,
  themeKey: 'pureLight',
  setThemeKey: () => {},
  isDark: false,
  fontSizeKey: 'default',
  fontScale: 1.0,
  setFontSizeKey: () => {},
  fontSizeOptions: FONT_SIZE_OPTIONS,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeKey, setThemeKeyState] = useState<ThemeKey>('pureLight');
  const [fontSizeKey, setFontSizeKeyState] = useState<FontSizeKey>('default');

  useEffect(() => {
    async function loadPreferences() {
      try {
        const [savedTheme, savedFontSize] = await Promise.all([
          AsyncStorage.getItem(THEME_STORAGE_KEY),
          AsyncStorage.getItem(FONT_SIZE_STORAGE_KEY),
        ]);

        if (savedTheme && savedTheme in THEMES) {
          setThemeKeyState(savedTheme as ThemeKey);
        }
        if (savedFontSize && savedFontSize in FONT_SIZE_OPTIONS) {
          setFontSizeKeyState(savedFontSize as FontSizeKey);
        }
      } catch (e) {
        console.warn('Failed to load theme/font preferences:', e);
      }
    }
    loadPreferences();
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

  const setFontSizeKey = async (key: FontSizeKey) => {
    hapticFeedback.selection();
    setFontSizeKeyState(key);
    try {
      await AsyncStorage.setItem(FONT_SIZE_STORAGE_KEY, key);
    } catch (e) {
      console.warn('Failed to save font size preference:', e);
    }
  };

  const theme = THEMES[themeKey] || THEMES.pureLight;
  const fontScale = FONT_SIZE_OPTIONS[fontSizeKey]?.scale ?? 1.0;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeKey,
        setThemeKey,
        isDark: theme.isDark,
        fontSizeKey,
        fontScale,
        setFontSizeKey,
        fontSizeOptions: FONT_SIZE_OPTIONS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
