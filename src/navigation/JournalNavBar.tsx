import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import {
  Sparkles,
  Layers,
  Compass,
  Calendar,
  Clock,
  RotateCcw,
  Settings,
} from 'lucide-react-native';

export type TabKey = 'goals' | 'breakdown' | 'quarters' | 'months' | 'week' | 'review' | 'settings';

interface JournalNavBarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const JournalNavBar: React.FC<JournalNavBarProps> = ({ currentTab, onSelectTab }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { theme } = useTheme();

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
    <View
      style={[
        styles.container,
        isDesktop && styles.containerDesktop,
        {
          backgroundColor: theme.colors.cardBackground,
          borderTopColor: theme.colors.cardBorder,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
      >
        {tabs.map(({ key, label, icon: IconComponent }) => {
          const isActive = currentTab === key;
          const color = isActive ? theme.colors.primary : theme.colors.textMuted;
          return (
            <Pressable
              key={key}
              onPress={() => onSelectTab(key)}
              style={[
                styles.tabButton,
                isActive && { backgroundColor: theme.colors.primaryLight },
              ]}
              hitSlop={6}
            >
              <IconComponent size={isDesktop ? 18 : 17} color={color} />
              <Text
                style={[
                  styles.tabLabel,
                  { color, fontFamily: theme.typography.fontFamilySans },
                  isActive && styles.tabLabelActive,
                ]}
              >
                {label}
              </Text>
              {isActive && (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingVertical: 6,
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
    borderRadius: 8,
    position: 'relative',
    minWidth: 54,
  },
  tabLabel: {
    fontSize: 10.5,
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
  },
});
