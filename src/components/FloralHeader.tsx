import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { THEME } from '../constants/theme';

interface FloralHeaderProps {
  title: string;
  subtitle?: string;
  year?: number;
}

export const FloralFlower = ({ size = 28, color = THEME.colors.primary, opacity = 0.85 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity }}>
    {/* 4 petals inspired by the physical journal print */}
    <Circle cx="50" cy="24" r="22" fill={color} opacity="0.65" />
    <Circle cx="50" cy="76" r="22" fill={color} opacity="0.65" />
    <Circle cx="24" cy="50" r="22" fill={color} opacity="0.65" />
    <Circle cx="76" cy="50" r="22" fill={color} opacity="0.65" />
    <Circle cx="50" cy="50" r="14" fill="#583B43" opacity="0.85" />
    <Circle cx="50" cy="50" r="6" fill="#FFF4E6" />
  </Svg>
);

export const FloralHeader: React.FC<FloralHeaderProps> = ({ title, subtitle, year }) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.decorArea}>
          {year ? (
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>{year}</Text>
            </View>
          ) : null}
          <FloralFlower size={34} />
        </View>
      </View>
      <View style={styles.dividerLine} />
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
  title: {
    fontSize: 26,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.textDark,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: THEME.typography.fontFamilySans,
    color: THEME.colors.textMuted,
    marginTop: 3,
    fontStyle: 'italic',
  },
  decorArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yearBadge: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6D3D7',
  },
  yearText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  dividerLine: {
    height: 1,
    backgroundColor: THEME.colors.cardBorder,
    marginTop: 12,
  },
});
