import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { THEME } from '../constants/theme';
import { Check, Star } from 'lucide-react-native';

interface PrioritySelectorProps {
  priority: 1 | 2 | 3;
  onChangePriority: (p: 1 | 2 | 3) => void;
  isTopThree?: boolean;
  onToggleTopThree?: () => void;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  priority,
  onChangePriority,
  isTopThree,
  onToggleTopThree,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.priorityRow}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.circles}>
          {([1, 2, 3] as const).map((level) => {
            const isFilled = priority >= level;
            return (
              <Pressable
                key={level}
                onPress={() => onChangePriority(level)}
                style={[
                  styles.circle,
                  isFilled && styles.circleFilled,
                ]}
                hitSlop={6}
              >
                {isFilled && <View style={styles.innerDot} />}
              </Pressable>
            );
          })}
        </View>
      </View>

      {onToggleTopThree && (
        <Pressable
          onPress={onToggleTopThree}
          style={[styles.topThreeBadge, isTopThree && styles.topThreeBadgeActive]}
          hitSlop={6}
        >
          <Star
            size={12}
            color={isTopThree ? '#FFFFFF' : THEME.colors.primary}
            fill={isTopThree ? '#FFFFFF' : 'none'}
          />
          <Text style={[styles.topThreeText, isTopThree && styles.topThreeTextActive]}>
            {isTopThree ? 'Top 3 Goal' : 'Set Top 3'}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.linedPaper,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontFamily: THEME.typography.fontFamilySans,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  circles: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: THEME.colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  circleFilled: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
  },
  topThreeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    backgroundColor: 'transparent',
  },
  topThreeBadgeActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  topThreeText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  topThreeTextActive: {
    color: '#FFFFFF',
  },
});
