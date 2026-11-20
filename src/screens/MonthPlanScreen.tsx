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
import { useTheme } from '../context/ThemeContext';
import { FloralHeader } from '../components/FloralHeader';
import { QuoteFooter } from '../components/QuoteFooter';
import { CheckboxItem } from '../components/CheckboxItem';
import { GoalScopeHeader } from '../components/GoalScopeHeader';
import { JOURNAL_QUOTES } from '../constants/quotes';
import { MONTH_NAMES, updateGoalMonth, getWeeksForMonth, getActiveGoalAreas } from '../storage/journalStorage';
import { CheckSquare, ListTodo, FileText, ArrowRight, Clock, RotateCcw } from 'lucide-react-native';

interface MonthPlanScreenProps {
  state: JournalState;
  onUpdateState: (newState: JournalState) => void;
  selectedArea: LifeArea;
  onSelectArea: (area: LifeArea) => void;
  selectedMonth: number;
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
  const { theme } = useTheme();
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
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
        areas={getActiveGoalAreas(state)}
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
              style={[
                styles.monthChip,
                {
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.cardBackground,
                  borderColor: isActive ? theme.colors.primary : theme.colors.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.monthChipText,
                  { color: isActive ? '#FFFFFF' : theme.colors.textDark },
                ]}
              >
                {name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Weeks of this month selector bar */}
      <View
        style={[
          styles.weeksBox,
          {
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder,
          },
        ]}
      >
        <View style={styles.weeksHeader}>
          <Clock size={15} color={theme.colors.primary} />
          <Text style={[styles.weeksTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
            Weekly Planners for {MONTH_NAMES[selectedMonth - 1]} ({getWeeksForMonth(state.year, selectedMonth).length} weeks in {state.year})
          </Text>
        </View>
        <View style={styles.weekButtonsGrid}>
          {getWeeksForMonth(state.year, selectedMonth).map((wInfo) => (
            <Pressable
              key={wInfo.weekIndex}
              onPress={() => onNavigateToWeek(selectedArea, selectedMonth, wInfo.weekIndex)}
              style={[
                styles.weekBtn,
                {
                  backgroundColor: theme.colors.primaryLight,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
              hitSlop={4}
            >
              <View style={styles.weekBtnContent}>
                <Text style={[styles.weekBtnLabel, { color: theme.colors.primary }]}>
                  Week {wInfo.weekIndex}
                </Text>
                <Text style={[styles.weekBtnDates, { color: theme.colors.textMuted }]}>
                  {wInfo.shortLabel}
                </Text>
              </View>
              <ArrowRight size={11} color={theme.colors.primary} />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Quick Jump to Month in Review */}
      <View style={styles.reviewBanner}>
        <Pressable
          onPress={() => onNavigateToReview(selectedArea, selectedMonth)}
          style={[
            styles.reviewBtn,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <RotateCcw size={15} color={theme.colors.primary} />
          <Text style={[styles.reviewBtnText, { color: theme.colors.primary }]}>
            Open Month in Review for {MONTH_NAMES[selectedMonth - 1]}
          </Text>
          <ArrowRight size={14} color={theme.colors.primary} />
        </Pressable>
      </View>

      <View style={styles.innerContent}>
        {/* Section 1: This month's key goals */}
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
            <CheckSquare size={17} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              This month's key goals
            </Text>
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
            <ListTodo size={17} color={theme.colors.secondary} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              To do
            </Text>
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
            <FileText size={17} color={theme.colors.textDark} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              Notes
            </Text>
          </View>
          <TextInput
            value={currentPlan.notes}
            onChangeText={handleNotesChange}
            placeholder={`Jot down thoughts or observations for ${MONTH_NAMES[selectedMonth - 1]} (${selectedArea})...`}
            placeholderTextColor={theme.colors.textLight}
            multiline
            numberOfLines={4}
            style={[styles.notesInput, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySans }]}
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
    borderWidth: 1,
  },
  monthChipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  weeksBox: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  weeksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  weeksTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  weekButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  weekBtn: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 95,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  weekBtnContent: {
    flexDirection: 'column',
  },
  weekBtnLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  weekBtnDates: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
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
    borderRadius: 8,
    paddingVertical: 9,
    borderWidth: 1,
  },
  reviewBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  innerContent: {
    paddingHorizontal: 16,
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
  notesInput: {
    fontSize: 14,
    lineHeight: 22,
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
