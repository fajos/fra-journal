import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { JournalState, MonthPlan } from '../types/journal';
import { THEME } from '../constants/theme';
import { FloralHeader } from '../components/FloralHeader';
import { QuoteFooter } from '../components/QuoteFooter';
import { CheckboxItem } from '../components/CheckboxItem';
import { JOURNAL_QUOTES } from '../constants/quotes';
import { MONTH_NAMES } from '../storage/journalStorage';
import { CheckSquare, ListTodo, FileText, ArrowRight } from 'lucide-react-native';

interface MonthPlanScreenProps {
  state: JournalState;
  onUpdateState: (newState: JournalState) => void;
  selectedMonth: number; // 1 - 12
  onSelectMonth: (m: number) => void;
  onNavigateToWeek?: () => void;
  onNavigateToReview?: () => void;
}

export const MonthPlanScreen: React.FC<MonthPlanScreenProps> = ({
  state,
  onUpdateState,
  selectedMonth,
  onSelectMonth,
  onNavigateToWeek,
  onNavigateToReview,
}) => {
  const currentPlan: MonthPlan = state.monthPlans[selectedMonth] || {
    monthIndex: selectedMonth,
    monthName: MONTH_NAMES[selectedMonth - 1],
    keyGoals: [
      { id: '1', text: '', completed: false },
      { id: '2', text: '', completed: false },
      { id: '3', text: '', completed: false },
      { id: '4', text: '', completed: false },
      { id: '5', text: '', completed: false },
    ],
    todos: [
      { id: '1', text: '', completed: false },
      { id: '2', text: '', completed: false },
      { id: '3', text: '', completed: false },
      { id: '4', text: '', completed: false },
      { id: '5', text: '', completed: false },
      { id: '6', text: '', completed: false },
    ],
    notes: '',
  };

  const updateMonthPlan = (updates: Partial<MonthPlan>) => {
    const updated = {
      ...state.monthPlans,
      [selectedMonth]: {
        ...currentPlan,
        ...updates,
      },
    };
    onUpdateState({ ...state, monthPlans: updated });
  };

  const handleToggleKeyGoal = (index: number) => {
    const goals = [...currentPlan.keyGoals];
    goals[index] = { ...goals[index], completed: !goals[index].completed };
    updateMonthPlan({ keyGoals: goals });
  };

  const handleChangeKeyGoalText = (index: number, text: string) => {
    const goals = [...currentPlan.keyGoals];
    goals[index] = { ...goals[index], text };
    updateMonthPlan({ keyGoals: goals });
  };

  const handleToggleTodo = (index: number) => {
    const todos = [...currentPlan.todos];
    todos[index] = { ...todos[index], completed: !todos[index].completed };
    updateMonthPlan({ todos });
  };

  const handleChangeTodoText = (index: number, text: string) => {
    const todos = [...currentPlan.todos];
    todos[index] = { ...todos[index], text };
    updateMonthPlan({ todos });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FloralHeader
        title={`Month ${MONTH_NAMES[selectedMonth - 1]}`}
        subtitle="Align your monthly priorities, to-dos, and thoughts"
        year={state.year}
      />

      {/* Month Picker Horizontal Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthScroll}
      >
        {MONTH_NAMES.map((name, i) => {
          const mIndex = i + 1;
          const isActive = mIndex === selectedMonth;
          return (
            <Pressable
              key={name}
              onPress={() => onSelectMonth(mIndex)}
              style={[styles.monthChip, isActive && styles.monthChipActive]}
            >
              <Text style={[styles.monthChipText, isActive && styles.monthChipTextActive]}>
                {name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Quick Action Navigation bar */}
      <View style={styles.quickActions}>
        {onNavigateToWeek && (
          <Pressable onPress={onNavigateToWeek} style={styles.actionPill}>
            <Text style={styles.actionPillText}>Open Weekly Planner</Text>
            <ArrowRight size={13} color={THEME.colors.primary} />
          </Pressable>
        )}
        {onNavigateToReview && (
          <Pressable onPress={onNavigateToReview} style={styles.actionPill}>
            <Text style={styles.actionPillText}>Month in Review</Text>
            <ArrowRight size={13} color={THEME.colors.primary} />
          </Pressable>
        )}
      </View>

      <View style={styles.innerContent}>
        {/* Section 1: This month's key goals */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CheckSquare size={17} color={THEME.colors.primary} />
            <Text style={styles.cardTitle}>This month's key goals</Text>
          </View>
          <View style={styles.list}>
            {currentPlan.keyGoals.map((item, idx) => (
              <CheckboxItem
                key={item.id || idx}
                text={item.text}
                completed={item.completed}
                placeholder={`Goal #${idx + 1}...`}
                onToggle={() => handleToggleKeyGoal(idx)}
                onChangeText={(t) => handleChangeKeyGoalText(idx, t)}
              />
            ))}
          </View>
        </View>

        {/* Section 2: To do */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ListTodo size={17} color={THEME.colors.secondary} />
            <Text style={styles.cardTitle}>To do</Text>
          </View>
          <View style={styles.list}>
            {currentPlan.todos.map((item, idx) => (
              <CheckboxItem
                key={item.id || idx}
                text={item.text}
                completed={item.completed}
                placeholder={`To-do task #${idx + 1}...`}
                onToggle={() => handleToggleTodo(idx)}
                onChangeText={(t) => handleChangeTodoText(idx, t)}
              />
            ))}
          </View>
        </View>

        {/* Section 3: Notes */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FileText size={17} color={THEME.colors.textDark} />
            <Text style={styles.cardTitle}>Notes</Text>
          </View>
          <TextInput
            value={currentPlan.notes}
            onChangeText={(t) => updateMonthPlan({ notes: t })}
            placeholder="Jot down observations, insights, inspirations, or journal entries for the month..."
            placeholderTextColor={THEME.colors.textLight}
            multiline
            numberOfLines={4}
            style={styles.notesInput}
          />
        </View>
      </View>

      <QuoteFooter
        quote={JOURNAL_QUOTES.monthPlan.text}
        author={JOURNAL_QUOTES.monthPlan.author}
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
  monthScroll: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  monthChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  monthChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  monthChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: THEME.colors.textDark,
  },
  monthChipTextActive: {
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: THEME.radius.sm,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  innerContent: {
    paddingHorizontal: 16,
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
  notesInput: {
    fontSize: 14,
    lineHeight: 22,
    color: THEME.colors.textDark,
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
