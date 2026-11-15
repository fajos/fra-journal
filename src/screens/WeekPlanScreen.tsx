import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { JournalState, LifeArea, WeekPlan } from '../types/journal';
import { THEME } from '../constants/theme';
import { FloralHeader } from '../components/FloralHeader';
import { QuoteFooter } from '../components/QuoteFooter';
import { CheckboxItem } from '../components/CheckboxItem';
import { GoalScopeHeader } from '../components/GoalScopeHeader';
import { JOURNAL_QUOTES } from '../constants/quotes';
import { MONTH_NAMES, updateGoalWeek } from '../storage/journalStorage';
import { Star, CalendarDays, ArrowRightLeft } from 'lucide-react-native';

interface WeekPlanScreenProps {
  state: JournalState;
  onUpdateState: (newState: JournalState) => void;
  selectedArea: LifeArea;
  onSelectArea: (area: LifeArea) => void;
  selectedMonth: number;
  onSelectMonth: (m: number) => void;
  selectedWeek: number; // 1 to 5
  onSelectWeek: (w: number) => void;
}

export const WeekPlanScreen: React.FC<WeekPlanScreenProps> = ({
  state,
  onUpdateState,
  selectedArea,
  onSelectArea,
  selectedMonth,
  onSelectMonth,
  selectedWeek,
  onSelectWeek,
}) => {
  const currentGoal = state.goals[selectedArea];
  if (!currentGoal) return null;

  const currentMonthPlan = currentGoal.monthPlans[selectedMonth];
  if (!currentMonthPlan) return null;

  const currentWeekPlan: WeekPlan = currentMonthPlan.weeks[selectedWeek] || {
    weekIndex: selectedWeek,
    weekOf: `Week ${selectedWeek}`,
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

  const handleUpdateWeekOf = (weekOf: string) => {
    onUpdateState(updateGoalWeek(state, selectedArea, selectedMonth, selectedWeek, { weekOf }));
  };

  const handleTogglePriority = (index: number) => {
    const items = [...currentWeekPlan.topPriorities];
    items[index] = { ...items[index], completed: !items[index].completed };
    onUpdateState(updateGoalWeek(state, selectedArea, selectedMonth, selectedWeek, { topPriorities: items }));
  };

  const handleChangePriorityText = (index: number, text: string) => {
    const items = [...currentWeekPlan.topPriorities];
    items[index] = { ...items[index], text };
    onUpdateState(updateGoalWeek(state, selectedArea, selectedMonth, selectedWeek, { topPriorities: items }));
  };

  const handleDayChange = (dayKey: keyof typeof currentWeekPlan.days, text: string) => {
    const days = {
      ...currentWeekPlan.days,
      [dayKey]: text,
    };
    onUpdateState(updateGoalWeek(state, selectedArea, selectedMonth, selectedWeek, { days }));
  };

  const handleCarryForwardChange = (carryForward: string) => {
    onUpdateState(updateGoalWeek(state, selectedArea, selectedMonth, selectedWeek, { carryForward }));
  };

  const daysList: { key: keyof typeof currentWeekPlan.days; label: string }[] = [
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
        title={`Week ${selectedWeek} • ${MONTH_NAMES[selectedMonth - 1]}`}
        subtitle={`Goal: ${selectedArea}`}
        year={state.year}
      />

      <GoalScopeHeader
        selectedArea={selectedArea}
        onSelectArea={onSelectArea}
        goalText={currentGoal.text}
        monthName={MONTH_NAMES[selectedMonth - 1]}
        weekIndex={selectedWeek}
      />

      {/* Month Selector Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectorStrip}
      >
        {MONTH_NAMES.map((name, i) => {
          const mIndex = i + 1;
          const isActive = mIndex === selectedMonth;
          return (
            <Pressable
              key={name}
              onPress={() => onSelectMonth(mIndex)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Week 1..5 Tabs */}
      <View style={styles.weekTabRow}>
        {([1, 2, 3, 4, 5] as const).map((wNum) => {
          const isAct = wNum === selectedWeek;
          return (
            <Pressable
              key={wNum}
              onPress={() => onSelectWeek(wNum)}
              style={[styles.weekTab, isAct && styles.weekTabActive]}
            >
              <Text style={[styles.weekTabText, isAct && styles.weekTabTextActive]}>
                Week {wNum}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.innerContent}>
        {/* Editable Week Of Header Input */}
        <View style={styles.weekOfBar}>
          <Text style={styles.weekOfLabel}>Week of:</Text>
          <TextInput
            value={currentWeekPlan.weekOf}
            onChangeText={handleUpdateWeekOf}
            placeholder="e.g. Jan 1 - Jan 7"
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
            {currentWeekPlan.topPriorities.map((item, idx) => (
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
                  value={currentWeekPlan.days[key]}
                  onChangeText={(t) => handleDayChange(key, t)}
                  placeholder={`Daily actions or notes for ${label}...`}
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
            value={currentWeekPlan.carryForward}
            onChangeText={handleCarryForwardChange}
            placeholder="Tasks or thoughts to carry into the next week..."
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
  selectorStrip: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  chipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textDark,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  weekTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 12,
  },
  weekTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: THEME.radius.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  weekTabActive: {
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.secondary,
  },
  weekTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textDark,
  },
  weekTabTextActive: {
    color: '#FFFFFF',
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
