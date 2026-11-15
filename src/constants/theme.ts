import { Platform } from 'react-native';

export const THEME = {
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
  },
  typography: {
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
  },
  shadow: {
    shadowColor: '#2B2520',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    full: 9999,
  },
};
