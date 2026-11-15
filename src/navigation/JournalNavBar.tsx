import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { THEME } from '../constants/theme';
import {
  Sparkles,
  Layers,
  Compass,
  Calendar,
  Clock,
  RotateCcw,
  Settings,
  Heart,
} from 'lucide-react-native';

export type TabKey = 'goals' | 'breakdown' | 'quarters' | 'months' | 'week' | 'review' | 'settings';

interface JournalNavBarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const JournalNavBar: React.FC<JournalNavBarProps> = ({ currentTab, onSelectTab }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const tabs: { key: TabKey; label: string; icon: React.FC<{ size: number; color: string }> }[] = [
    { key: 'goals', label: 'Year Goals', icon: Sparkles },
    { key: 'breakdown', label: 'Breakdown', icon: Layers },
    { key: 'quarters', label: 'Quarters', icon: Compass },
    { key: 'months', label: 'Month Plan', icon: Calendar },
    { key: 'week', label: 'Weekly', icon: Clock },
    { key: 'review', label: 'Review', icon: RotateCcw },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
      >
        {tabs.map(({ key, label, icon: IconComponent }) => {
          const isActive = currentTab === key;
          const color = isActive ? THEME.colors.primary : THEME.colors.textMuted;
          return (
            <Pressable
              key={key}
              onPress={() => onSelectTab(key)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              hitSlop={6}
            >
              <IconComponent size={isDesktop ? 18 : 17} color={color} />
              <Text style={[styles.tabLabel, { color }, isActive && styles.tabLabelActive]}>
                {label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
    paddingVertical: 6,
    ...THEME.shadow,
  },
  containerDesktop: {
    paddingVertical: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
    minWidth: '100%',
    justifyContent: 'space-around',
  },
  scrollContentDesktop: {
    justifyContent: 'center',
    gap: 16,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: THEME.radius.sm,
    position: 'relative',
    minWidth: 54,
  },
  tabButtonActive: {
    backgroundColor: THEME.colors.primaryLight,
  },
  tabLabel: {
    fontSize: 10.5,
    fontFamily: THEME.typography.fontFamilySans,
    fontWeight: '500',
    marginTop: 3,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 14,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: THEME.colors.primary,
  },
});
