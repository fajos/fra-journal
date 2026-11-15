import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LifeArea, LIFE_AREAS } from '../types/journal';
import { THEME } from '../constants/theme';
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
}

export const getLifeAreaIcon = (area: LifeArea, size = 15, color = THEME.colors.primary) => {
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
  }
};

export const GoalScopeHeader: React.FC<GoalScopeHeaderProps> = ({
  selectedArea,
  onSelectArea,
  goalText,
  quarter,
  monthName,
  weekIndex,
}) => {
  return (
    <View style={styles.container}>
      {/* Breadcrumb banner */}
      <View style={styles.breadcrumbRow}>
        <View style={styles.crumbItem}>
          {getLifeAreaIcon(selectedArea, 13, THEME.colors.primary)}
          <Text style={styles.crumbTextBold}>{selectedArea}</Text>
        </View>

        {quarter !== undefined && (
          <>
            <ChevronRight size={11} color={THEME.colors.textLight} />
            <Text style={styles.crumbText}>Q{quarter}</Text>
          </>
        )}

        {monthName && (
          <>
            <ChevronRight size={11} color={THEME.colors.textLight} />
            <Text style={styles.crumbText}>{monthName}</Text>
          </>
        )}

        {weekIndex !== undefined && (
          <>
            <ChevronRight size={11} color={THEME.colors.textLight} />
            <Text style={styles.crumbTextHighlight}>Week {weekIndex}</Text>
          </>
        )}
      </View>

      {/* Goal Summary banner */}
      {goalText ? (
        <View style={styles.goalPreviewBar}>
          <Target size={13} color={THEME.colors.primary} />
          <Text style={styles.goalPreviewText} numberOfLines={1}>
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
        {LIFE_AREAS.map((item) => {
          const isActive = item.key === selectedArea;
          return (
            <Pressable
              key={item.key}
              onPress={() => onSelectArea(item.key)}
              style={[styles.chip, isActive && styles.chipActive]}
              hitSlop={4}
            >
              {getLifeAreaIcon(item.key, 12, isActive ? '#FFFFFF' : THEME.colors.primary)}
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
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
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
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
    color: THEME.colors.primary,
  },
  crumbText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  crumbTextHighlight: {
    fontSize: 12,
    color: THEME.colors.textDark,
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
    color: THEME.colors.textDark,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  chipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: THEME.colors.textDark,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
