import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LifeArea, LIFE_AREAS } from '../types/journal';
import { useTheme } from '../context/ThemeContext';
import {
  Sparkles,
  Heart,
  Sun,
  Briefcase,
  Coins,
  Users,
  HandHeart,
  Palmtree,
  Target,
  ChevronRight,
} from 'lucide-react-native';

interface GoalScopeHeaderProps {
  selectedArea: LifeArea;
  onSelectArea: (area: LifeArea) => void;
  goalText?: string;
  quarter?: number;
  monthName?: string;
  weekIndex?: number;
  areas?: { key: string; label: string }[];
}

export const getLifeAreaIcon = (area: LifeArea, size = 15, color = '#8E5B67') => {
  switch (area) {
    case 'Personal growth':
      return <Sparkles size={size} color={color} />;
    case 'Health and wellbeing':
      return <Heart size={size} color={color} />;
    case 'Spiritual life':
      return <Sun size={size} color={color} />;
    case 'Career or business':
      return <Briefcase size={size} color={color} />;
    case 'Financial':
      return <Coins size={size} color={color} />;
    case 'Family and relationships':
      return <Users size={size} color={color} />;
    case 'Community and impact':
      return <HandHeart size={size} color={color} />;
    case 'Rest and joy':
      return <Palmtree size={size} color={color} />;
    default:
      return <Target size={size} color={color} />;
  }
};

export const GoalScopeHeader: React.FC<GoalScopeHeaderProps> = ({
  selectedArea,
  onSelectArea,
  goalText,
  quarter,
  monthName,
  weekIndex,
  areas,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.isDark ? 'rgba(28, 28, 33, 0.9)' : 'rgba(255, 255, 255, 0.75)',
          borderBottomColor: theme.colors.cardBorder,
        },
      ]}
    >
      {/* Breadcrumb banner */}
      <View style={styles.breadcrumbRow}>
        <View style={styles.crumbItem}>
          {getLifeAreaIcon(selectedArea, 13, theme.colors.primary)}
          <Text style={[styles.crumbTextBold, { color: theme.colors.primary }]}>{selectedArea}</Text>
        </View>

        {quarter !== undefined && (
          <>
            <ChevronRight size={11} color={theme.colors.textLight} />
            <Text style={[styles.crumbText, { color: theme.colors.textMuted }]}>Q{quarter}</Text>
          </>
        )}

        {monthName && (
          <>
            <ChevronRight size={11} color={theme.colors.textLight} />
            <Text style={[styles.crumbText, { color: theme.colors.textMuted }]}>{monthName}</Text>
          </>
        )}

        {weekIndex !== undefined && (
          <>
            <ChevronRight size={11} color={theme.colors.textLight} />
            <Text style={[styles.crumbTextHighlight, { color: theme.colors.textDark }]}>Week {weekIndex}</Text>
          </>
        )}
      </View>

      {/* Goal Summary banner */}
      {goalText ? (
        <View style={styles.goalPreviewBar}>
          <Target size={13} color={theme.colors.primary} />
          <Text style={[styles.goalPreviewText, { color: theme.colors.textDark }]} numberOfLines={1}>
            {goalText}
          </Text>
        </View>
      ) : null}

      {/* Goal Selector Horizontal Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        {(areas || LIFE_AREAS).map((item) => {
          const isActive = item.key === selectedArea;
          return (
            <Pressable
              key={item.key}
              onPress={() => onSelectArea(item.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.cardBackground,
                  borderColor: isActive ? theme.colors.primary : theme.colors.cardBorder,
                },
              ]}
              hitSlop={4}
            >
              {getLifeAreaIcon(item.key, 12, isActive ? '#FFFFFF' : theme.colors.primary)}
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? '#FFFFFF' : theme.colors.textDark },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingTop: 8,
    paddingBottom: 6,
    marginBottom: 8,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 5,
    marginBottom: 4,
  },
  crumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  crumbTextBold: {
    fontSize: 12,
    fontWeight: '700',
  },
  crumbText: {
    fontSize: 12,
    fontWeight: '500',
  },
  crumbTextHighlight: {
    fontSize: 12,
    fontWeight: '700',
  },
  goalPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  goalPreviewText: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  chipsScroll: {
    paddingHorizontal: 14,
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
});
