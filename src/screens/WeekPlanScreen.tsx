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
import { useTheme } from '../context/ThemeContext';
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
  selectedWeek: number;
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
  const { theme } = useTheme();
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
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
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.cardBackground,
                  borderColor: isActive ? theme.colors.primary : theme.colors.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? '#FFFFFF' : theme.colors.textDark },
                ]}
              >
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
              style={[
                styles.weekTab,
                {
                  backgroundColor: isAct ? theme.colors.secondary : theme.colors.cardBackground,
                  borderColor: isAct ? theme.colors.secondary : theme.colors.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.weekTabText,
                  { color: isAct ? '#FFFFFF' : theme.colors.textDark },
                ]}
              >
                Week {wNum}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.innerContent}>
        {/* Editable Week Of Header Input */}
        <View
          style={[
            styles.weekOfBar,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.weekOfLabel, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
            Week of:
          </Text>
          <TextInput
            value={currentWeekPlan.weekOf}
            onChangeText={handleUpdateWeekOf}
            placeholder="e.g. Jan 1 - Jan 7"
            placeholderTextColor={theme.colors.textLight}
            style={[styles.weekOfInput, { color: theme.colors.primary }]}
          />
        </View>

        {/* Top 3 Priorities */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={[styles.cardHeader, { borderBottomColor: theme.colors.linedPaper }]}>
            <Star size={17} color={theme.colors.primary} fill={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              My top 3 priorities this week
            </Text>
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
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={[styles.cardHeader, { borderBottomColor: theme.colors.linedPaper }]}>
            <CalendarDays size={17} color={theme.colors.secondary} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              Daily agenda & reflections
            </Text>
          </View>
          <View style={styles.daysContainer}>
            {daysList.map(({ key, label }) => (
              <View key={key} style={[styles.dayRow, { borderBottomColor: theme.colors.linedPaper }]}>
                <Text style={[styles.dayLabel, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
                  {label}
                </Text>
                <TextInput
                  value={currentWeekPlan.days[key]}
                  onChangeText={(t) => handleDayChange(key, t)}
                  placeholder={`Daily actions or notes for ${label}...`}
                  placeholderTextColor={theme.colors.textLight}
                  style={[styles.dayInput, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySans }]}
                  multiline={false}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Carry Forward */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={[styles.cardHeader, { borderBottomColor: theme.colors.linedPaper }]}>
            <ArrowRightLeft size={17} color={theme.colors.textDark} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              Carry forward
            </Text>
          </View>
          <TextInput
            value={currentWeekPlan.carryForward}
            onChangeText={handleCarryForwardChange}
            placeholder="Tasks or thoughts to carry into the next week..."
            placeholderTextColor={theme.colors.textLight}
            multiline
            numberOfLines={3}
            style={[styles.carryInput, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySans }]}
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
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
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
    borderRadius: 8,
    borderWidth: 1,
  },
  weekTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  innerContent: {
    paddingHorizontal: 16,
  },
  weekOfBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  weekOfLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  weekOfInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
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
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  dayInput: {
    fontSize: 13.5,
    paddingVertical: 2,
  },
  carryInput: {
    fontSize: 14,
    lineHeight: 22,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
