import { Platform } from 'react-native';

export type ThemeKey = 'warmPaper' | 'pureLight' | 'midnightDark' | 'botanicalSage';

export interface ThemeColors {
  background: string;
  cardBackground: string;
  cardBorder: string;
  cardBorderHover: string;
  linedPaper: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  textDark: string;
  textMuted: string;
  textLight: string;
  accentGold: string;
  danger: string;
  success: string;
  checkboxBorder: string;
  checkboxChecked: string;
  deskBackground: string;
}

export interface AppTheme {
  name: string;
  key: ThemeKey;
  isDark: boolean;
  colors: ThemeColors;
  typography: {
    fontFamilySerif: string | undefined;
    fontFamilySans: string | undefined;
  };
  shadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
}

const sharedTypography = {
  fontFamilySerif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    web: "'Playfair Display', 'Georgia', 'Times New Roman', serif",
    default: 'serif',
  }),
  fontFamilySans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: 'sans-serif',
  }),
};

const sharedRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 9999,
};

export const THEMES: Record<ThemeKey, AppTheme> = {
  warmPaper: {
    name: 'Warm Linen Paper',
    key: 'warmPaper',
    isDark: false,
    colors: {
      background: '#FAF7F2',
      cardBackground: '#FFFFFF',
      cardBorder: '#EAE3D9',
      cardBorderHover: '#D4C9BC',
      linedPaper: '#EFE9E0',
      primary: '#8E5B67', // Dusty rose from the journal floral motifs
      primaryLight: '#F5ECEE',
      primaryDark: '#683F49',
      secondary: '#5E7761', // Warm sage
      secondaryLight: '#EBF1EB',
      textDark: '#3A312A', // Deep warm espresso
      textMuted: '#7D7267', // Warm taupe
      textLight: '#A3988E',
      accentGold: '#C59B27',
      danger: '#B34040',
      success: '#4A7C59',
      checkboxBorder: '#7D7267',
      checkboxChecked: '#8E5B67',
      deskBackground: '#F3EFEA',
    },
    typography: sharedTypography,
    shadow: {
      shadowColor: '#2B2520',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    radius: sharedRadius,
  },

  pureLight: {
    name: 'Pure Minimalist White',
    key: 'pureLight',
    isDark: false,
    colors: {
      background: '#F8FAFC',
      cardBackground: '#FFFFFF',
      cardBorder: '#E2E8F0',
      cardBorderHover: '#CBD5E1',
      linedPaper: '#EDF2F7',
      primary: '#2563EB', // Modern royal blue
      primaryLight: '#EFF6FF',
      primaryDark: '#1D4ED8',
      secondary: '#0D9488', // Teal accent
      secondaryLight: '#F0FDFA',
      textDark: '#0F172A',
      textMuted: '#64748B',
      textLight: '#94A3B8',
      accentGold: '#D97706',
      danger: '#DC2626',
      success: '#16A34A',
      checkboxBorder: '#94A3B8',
      checkboxChecked: '#2563EB',
      deskBackground: '#EEF2F6',
    },
    typography: sharedTypography,
    shadow: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    radius: sharedRadius,
  },

  midnightDark: {
    name: 'Midnight Velvet Dark',
    key: 'midnightDark',
    isDark: true,
    colors: {
      background: '#131316',
      cardBackground: '#1C1C21',
      cardBorder: '#2E2E36',
      cardBorderHover: '#42424E',
      linedPaper: '#27272F',
      primary: '#D9899C', // Luminous soft rose for dark mode
      primaryLight: '#2C1D23',
      primaryDark: '#B36577',
      secondary: '#7BA786', // Luminous soft sage
      secondaryLight: '#1C2620',
      textDark: '#F4F4F6',
      textMuted: '#A1A1AA',
      textLight: '#71717A',
      accentGold: '#F59E0B',
      danger: '#EF4444',
      success: '#22C55E',
      checkboxBorder: '#71717A',
      checkboxChecked: '#D9899C',
      deskBackground: '#09090B',
    },
    typography: sharedTypography,
    shadow: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
    radius: sharedRadius,
  },

  botanicalSage: {
    name: 'Botanical Sage Calm',
    key: 'botanicalSage',
    isDark: false,
    colors: {
      background: '#F1F5F2',
      cardBackground: '#FFFFFF',
      cardBorder: '#D7DFD8',
      cardBorderHover: '#BCC9BE',
      linedPaper: '#E5ECE7',
      primary: '#3F6149', // Earthy eucalyptus green
      primaryLight: '#E8EFEA',
      primaryDark: '#2E4936',
      secondary: '#8C674D', // Warm earth bronze
      secondaryLight: '#F5EDE8',
      textDark: '#1E2C22',
      textMuted: '#586A5D',
      textLight: '#8C9B90',
      accentGold: '#B8860B',
      danger: '#B93838',
      success: '#3A7D44',
      checkboxBorder: '#788A7D',
      checkboxChecked: '#3F6149',
      deskBackground: '#E6ECE7',
    },
    typography: sharedTypography,
    shadow: {
      shadowColor: '#1E2C22',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    radius: sharedRadius,
  },
};

// Default backward-compatible fallback
export const THEME = THEMES.warmPaper;
