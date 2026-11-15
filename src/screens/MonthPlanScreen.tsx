import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { JournalState, LifeArea, MonthPlan } from '../types/journal';
import { THEME } from '../constants/theme';
import { FloralHeader } from '../components/FloralHeader';
import { QuoteFooter } from '../components/QuoteFooter';
import { CheckboxItem } from '../components/CheckboxItem';
import { GoalScopeHeader } from '../components/GoalScopeHeader';
import { JOURNAL_QUOTES } from '../constants/quotes';
import { MONTH_NAMES, updateGoalMonth } from '../storage/journalStorage';
import { CheckSquare, ListTodo, FileText, ArrowRight, Clock, RotateCcw } from 'lucide-react-native';

interface MonthPlanScreenProps {
  state: JournalState;
  onUpdateState: (newState: JournalState) => void;
  selectedArea: LifeArea;
  onSelectArea: (area: LifeArea) => void;
  selectedMonth: number; // 1 - 12
  onSelectMonth: (m: number) => void;
  onNavigateToWeek: (area: LifeArea, month: number, week: number) => void;
  onNavigateToReview: (area: LifeArea, month: number) => void;
}

export const MonthPlanScreen: React.FC<MonthPlanScreenProps> = ({
  state,
  onUpdateState,
  selectedArea,
  onSelectArea,
  selectedMonth,
  onSelectMonth,
  onNavigateToWeek,
  onNavigateToReview,
}) => {
  const currentGoal = state.goals[selectedArea];
  if (!currentGoal) return null;

  const currentPlan: MonthPlan = currentGoal.monthPlans[selectedMonth];
  if (!currentPlan) return null;

  const handleToggleKeyGoal = (index: number) => {
    const goals = [...currentPlan.keyGoals];
    goals[index] = { ...goals[index], completed: !goals[index].completed };
    onUpdateState(updateGoalMonth(state, selectedArea, selectedMonth, { keyGoals: goals }));
  };

  const handleChangeKeyGoalText = (index: number, text: string) => {
    const goals = [...currentPlan.keyGoals];
    goals[index] = { ...goals[index], text };
    onUpdateState(updateGoalMonth(state, selectedArea, selectedMonth, { keyGoals: goals }));
  };

  const handleToggleTodo = (index: number) => {
    const todos = [...currentPlan.todos];
    todos[index] = { ...todos[index], completed: !todos[index].completed };
    onUpdateState(updateGoalMonth(state, selectedArea, selectedMonth, { todos }));
  };

  const handleChangeTodoText = (index: number, text: string) => {
    const todos = [...currentPlan.todos];
    todos[index] = { ...todos[index], text };
    onUpdateState(updateGoalMonth(state, selectedArea, selectedMonth, { todos }));
  };

  const handleNotesChange = (notes: string) => {
    onUpdateState(updateGoalMonth(state, selectedArea, selectedMonth, { notes }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FloralHeader
        title={`Month ${MONTH_NAMES[selectedMonth - 1]}`}
        subtitle={`Goal: ${selectedArea}`}
        year={state.year}
      />

      <GoalScopeHeader
        selectedArea={selectedArea}
        onSelectArea={onSelectArea}
        goalText={currentGoal.text}
        monthName={MONTH_NAMES[selectedMonth - 1]}
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

      {/* Weeks of this month selector bar */}
      <View style={styles.weeksBox}>
        <View style={styles.weeksHeader}>
          <Clock size={15} color={THEME.colors.primary} />
          <Text style={styles.weeksTitle}>Weekly Planners for {MONTH_NAMES[selectedMonth - 1]}</Text>
        </View>
        <View style={styles.weekButtonsRow}>
          {([1, 2, 3, 4, 5] as const).map((wNum) => (
            <Pressable
              key={wNum}
              onPress={() => onNavigateToWeek(selectedArea, selectedMonth, wNum)}
              style={styles.weekBtn}
              hitSlop={4}
            >
              <Text style={styles.weekBtnLabel}>Week {wNum}</Text>
              <ArrowRight size={11} color={THEME.colors.primary} />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Quick Jump to Month in Review */}
      <View style={styles.reviewBanner}>
        <Pressable
          onPress={() => onNavigateToReview(selectedArea, selectedMonth)}
          style={styles.reviewBtn}
        >
          <RotateCcw size={15} color={THEME.colors.primary} />
          <Text style={styles.reviewBtnText}>
            Open Month in Review for {MONTH_NAMES[selectedMonth - 1]}
          </Text>
          <ArrowRight size={14} color={THEME.colors.primary} />
        </Pressable>
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
                placeholder={`Goal #${idx + 1} for ${MONTH_NAMES[selectedMonth - 1]}...`}
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
            onChangeText={handleNotesChange}
            placeholder={`Jot down thoughts, milestones, or observations for ${MONTH_NAMES[selectedMonth - 1]} (${selectedArea})...`}
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
  weeksBox: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: 12,
    marginBottom: 10,
    ...THEME.shadow,
  },
  weeksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  weeksTitle: {
    fontSize: 13,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.textDark,
  },
  weekButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  weekBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: THEME.colors.primaryLight,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8D6DA',
  },
  weekBtnLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  reviewBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: THEME.radius.sm,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  reviewBtnText: {
    fontSize: 12.5,
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
