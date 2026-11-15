import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { JournalState, WeekPlan } from '../types/journal';
import { THEME } from '../constants/theme';
import { FloralHeader } from '../components/FloralHeader';
import { QuoteFooter } from '../components/QuoteFooter';
import { CheckboxItem } from '../components/CheckboxItem';
import { JOURNAL_QUOTES } from '../constants/quotes';
import { Star, CalendarDays, ArrowRightLeft, Edit3 } from 'lucide-react-native';

interface WeekPlanScreenProps {
  state: JournalState;
  onUpdateState: (newState: JournalState) => void;
}

export const WeekPlanScreen: React.FC<WeekPlanScreenProps> = ({
  state,
  onUpdateState,
}) => {
  const currentWeek: WeekPlan = state.weekPlans.current || {
    id: 'current',
    weekOf: 'January 5 - January 11',
    topPriorities: [
      { id: '1', text: '', completed: false },
      { id: '2', text: '', completed: false },
      { id: '3', text: '', completed: false },
    ],
    days: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    },
    carryForward: '',
  };

  const updateWeek = (updates: Partial<WeekPlan>) => {
    const updated = {
      ...state.weekPlans,
      current: {
        ...currentWeek,
        ...updates,
      },
    };
    onUpdateState({ ...state, weekPlans: updated });
  };

  const handleTogglePriority = (index: number) => {
    const items = [...currentWeek.topPriorities];
    items[index] = { ...items[index], completed: !items[index].completed };
    updateWeek({ topPriorities: items });
  };

  const handleChangePriorityText = (index: number, text: string) => {
    const items = [...currentWeek.topPriorities];
    items[index] = { ...items[index], text };
    updateWeek({ topPriorities: items });
  };

  const handleDayChange = (dayKey: keyof typeof currentWeek.days, text: string) => {
    updateWeek({
      days: {
        ...currentWeek.days,
        [dayKey]: text,
      },
    });
  };

  const daysList: { key: keyof typeof currentWeek.days; label: string }[] = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FloralHeader
        title="Weekly planner"
        subtitle={`Week of: ${currentWeek.weekOf}`}
        year={state.year}
      />

      <View style={styles.innerContent}>
        {/* Editable Week Of Header Input */}
        <View style={styles.weekOfBar}>
          <Text style={styles.weekOfLabel}>Week of:</Text>
          <TextInput
            value={currentWeek.weekOf}
            onChangeText={(t) => updateWeek({ weekOf: t })}
            placeholder="e.g. Oct 12 - Oct 18"
            placeholderTextColor={THEME.colors.textLight}
            style={styles.weekOfInput}
          />
        </View>

        {/* Top 3 Priorities */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Star size={17} color={THEME.colors.primary} fill={THEME.colors.primary} />
            <Text style={styles.cardTitle}>My top 3 priorities this week</Text>
          </View>
          <View style={styles.list}>
            {currentWeek.topPriorities.map((item, idx) => (
              <CheckboxItem
                key={item.id || idx}
                text={item.text}
                completed={item.completed}
                placeholder={`Top Priority #${idx + 1}...`}
                onToggle={() => handleTogglePriority(idx)}
                onChangeText={(t) => handleChangePriorityText(idx, t)}
              />
            ))}
          </View>
        </View>

        {/* Days of Week */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CalendarDays size={17} color={THEME.colors.secondary} />
            <Text style={styles.cardTitle}>Daily agenda & reflections</Text>
          </View>
          <View style={styles.daysContainer}>
            {daysList.map(({ key, label }) => (
              <View key={key} style={styles.dayRow}>
                <Text style={styles.dayLabel}>{label}</Text>
                <TextInput
                  value={currentWeek.days[key]}
                  onChangeText={(t) => handleDayChange(key, t)}
                  placeholder={`Plan or highlights for ${label}...`}
                  placeholderTextColor={THEME.colors.textLight}
                  style={styles.dayInput}
                  multiline={false}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Carry Forward */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ArrowRightLeft size={17} color={THEME.colors.textDark} />
            <Text style={styles.cardTitle}>Carry forward</Text>
          </View>
          <TextInput
            value={currentWeek.carryForward}
            onChangeText={(t) => updateWeek({ carryForward: t })}
            placeholder="Tasks, thoughts, or intentions to carry into next week..."
            placeholderTextColor={THEME.colors.textLight}
            multiline
            numberOfLines={3}
            style={styles.carryInput}
          />
        </View>
      </View>

      <QuoteFooter
        quote={JOURNAL_QUOTES.weekPlan.text}
        author={JOURNAL_QUOTES.weekPlan.author}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  innerContent: {
    paddingHorizontal: 16,
  },
  weekOfBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    marginBottom: 12,
    gap: 8,
  },
  weekOfLabel: {
    fontSize: 14,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.textDark,
  },
  weekOfInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: 16,
    marginBottom: 14,
    ...THEME.shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.linedPaper,
    paddingBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.textDark,
  },
  list: {
    gap: 2,
  },
  daysContainer: {
    gap: 6,
  },
  dayRow: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.linedPaper,
  },
  dayLabel: {
    fontSize: 13,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.textDark,
    marginBottom: 2,
  },
  dayInput: {
    fontSize: 13.5,
    color: THEME.colors.textDark,
    paddingVertical: 2,
  },
  carryInput: {
    fontSize: 14,
    lineHeight: 22,
    color: THEME.colors.textDark,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
