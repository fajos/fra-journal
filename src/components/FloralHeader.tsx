import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text } from './AppText';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { Calendar, ChevronDown, Sparkles } from 'lucide-react-native';

interface FloralHeaderProps {
  title: string;
  subtitle?: string;
  year?: number;
  onPressYear?: () => void;
  isPro?: boolean;
  showLogo?: boolean;
}

export const FloralFlower = ({ size = 28, color, opacity = 0.85 }: { size?: number; color?: string; opacity?: number }) => {
  const { theme } = useTheme();
  const petalColor = color || theme.colors.primary;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity }}>
      {/* 4 petals inspired by the physical journal print */}
      <Circle cx="50" cy="24" r="22" fill={petalColor} opacity="0.65" />
      <Circle cx="50" cy="76" r="22" fill={petalColor} opacity="0.65" />
      <Circle cx="24" cy="50" r="22" fill={petalColor} opacity="0.65" />
      <Circle cx="76" cy="50" r="22" fill={petalColor} opacity="0.65" />
      <Circle cx="50" cy="50" r="14" fill={theme.isDark ? '#E5B8C2' : '#583B43'} opacity="0.85" />
      <Circle cx="50" cy="50" r="6" fill={theme.isDark ? '#2B1C22' : '#FFF4E6'} />
    </Svg>
  );
};

export const FloralHeader: React.FC<FloralHeaderProps> = ({
  title,
  subtitle,
  year,
  onPressYear,
  isPro,
  showLogo = true,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <View style={styles.titleWithBadgeRow}>
            {isPro && (
              <View style={[styles.proBadge, { backgroundColor: theme.colors.primary }]}>
                <Sparkles size={11} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.textDark,
                  fontFamily: theme.typography.fontFamilySerif,
                },
              ]}
            >
              {title}
            </Text>
          </View>
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.textMuted,
                  fontFamily: theme.typography.fontFamilySans,
                },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.decorArea}>
          {year ? (
            <Pressable
              onPress={onPressYear}
              disabled={!onPressYear}
              style={[
                styles.yearBadge,
                {
                  backgroundColor: theme.colors.primaryLight,
                  borderColor: theme.colors.cardBorder,
                },
                Boolean(onPressYear) && styles.yearBadgeInteractive,
              ]}
              hitSlop={6}
            >
              {onPressYear && (
                <Calendar size={12} color={theme.colors.primary} style={{ marginRight: 4 }} />
              )}
              <Text style={[styles.yearText, { color: theme.colors.primary }]}>{year}</Text>
              {onPressYear && (
                <ChevronDown size={12} color={theme.colors.primary} style={{ marginLeft: 3 }} />
              )}
            </Pressable>
          ) : null}
          {showLogo ? (
            <Image
              source={require('../../assets/icon-512-transparent.png')}
              style={styles.appLogo}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </View>
      <View style={[styles.dividerLine, { backgroundColor: theme.colors.cardBorder }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleArea: {
    flex: 1,
    paddingRight: 10,
  },
  titleWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginBottom: 2,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 3,
    fontStyle: 'italic',
  },
  decorArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yearBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  yearBadgeInteractive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  dividerLine: {
    height: 1,
    marginTop: 12,
  },
});
