import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { hapticFeedback } from '../services/hapticsService';

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
  const { theme } = useTheme();

  const handleSelect = (level: 1 | 2 | 3) => {
    hapticFeedback.selection();
    onChangePriority(level);
  };

  const handleTopThree = () => {
    hapticFeedback.medium();
    if (onToggleTopThree) onToggleTopThree();
  };

  return (
    <View style={[styles.container, { borderTopColor: theme.colors.linedPaper }]}>
      <View style={styles.priorityRow}>
        <Text style={[styles.label, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamilySans }]}>
          Priority
        </Text>
        <View style={styles.circles}>
          {([1, 2, 3] as const).map((level) => {
            const isFilled = priority >= level;
            return (
              <Pressable
                key={level}
                onPress={() => handleSelect(level)}
                style={[
                  styles.circle,
                  {
                    borderColor: isFilled ? theme.colors.primary : theme.colors.textMuted,
                    backgroundColor: isFilled ? theme.colors.primaryLight : theme.colors.cardBackground,
                  },
                ]}
                hitSlop={6}
              >
                {isFilled && <View style={[styles.innerDot, { backgroundColor: theme.colors.primary }]} />}
              </Pressable>
            );
          })}
        </View>
      </View>

      {onToggleTopThree && (
        <Pressable
          onPress={handleTopThree}
          style={[
            styles.topThreeBadge,
            {
              borderColor: theme.colors.primary,
              backgroundColor: isTopThree ? theme.colors.primary : 'transparent',
            },
          ]}
          hitSlop={6}
        >
          <Star
            size={12}
            color={isTopThree ? '#FFFFFF' : theme.colors.primary}
            fill={isTopThree ? '#FFFFFF' : 'none'}
          />
          <Text
            style={[
              styles.topThreeText,
              { color: isTopThree ? '#FFFFFF' : theme.colors.primary },
            ]}
          >
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
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 12,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topThreeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  topThreeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
