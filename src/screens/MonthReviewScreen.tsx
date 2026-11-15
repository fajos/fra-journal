import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { JournalState, LifeArea, MonthReview } from '../types/journal';
import { THEME } from '../constants/theme';
import { FloralHeader } from '../components/FloralHeader';
import { QuoteFooter } from '../components/QuoteFooter';
import { CheckboxItem } from '../components/CheckboxItem';
import { GoalScopeHeader } from '../components/GoalScopeHeader';
import { JOURNAL_QUOTES } from '../constants/quotes';
import { MONTH_NAMES, updateGoalMonthReview } from '../storage/journalStorage';
import {
  Trophy,
  AlertCircle,
  HelpCircle,
  ArrowRightLeft,
  Sparkles,
  Plus,
} from 'lucide-react-native';

interface MonthReviewScreenProps {
  state: JournalState;
  onUpdateState: (newState: JournalState) => void;
  selectedArea: LifeArea;
  onSelectArea: (area: LifeArea) => void;
  selectedMonth: number;
  onSelectMonth: (m: number) => void;
}

export const MonthReviewScreen: React.FC<MonthReviewScreenProps> = ({
  state,
  onUpdateState,
  selectedArea,
  onSelectArea,
  selectedMonth,
  onSelectMonth,
}) => {
  const currentGoal = state.goals[selectedArea];
  if (!currentGoal) return null;

  const currentMonthPlan = currentGoal.monthPlans[selectedMonth];
  if (!currentMonthPlan) return null;

  const currentReview: MonthReview = currentMonthPlan.review || {
    whatIAchieved: '',
    whatWasLeftUndone: '',
    whatGotInTheWay: '',
    carryForwardItems: [
      { id: '1', text: '', completed: false },
      { id: '2', text: '', completed: false },
    ],
    reflection: {
      oneWin: '',
      oneLesson: '',
      gratefulFor: '',
    },
  };

  const handleUpdateAchieved = (whatIAchieved: string) => {
    onUpdateState(updateGoalMonthReview(state, selectedArea, selectedMonth, { whatIAchieved }));
  };

  const handleUpdateUndone = (whatWasLeftUndone: string) => {
    onUpdateState(updateGoalMonthReview(state, selectedArea, selectedMonth, { whatWasLeftUndone }));
  };

  const handleUpdateGotInTheWay = (whatGotInTheWay: string) => {
    onUpdateState(updateGoalMonthReview(state, selectedArea, selectedMonth, { whatGotInTheWay }));
  };

  const handleToggleCarryForward = (index: number) => {
    const items = [...currentReview.carryForwardItems];
    items[index] = { ...items[index], completed: !items[index].completed };
    onUpdateState(updateGoalMonthReview(state, selectedArea, selectedMonth, { carryForwardItems: items }));
  };

  const handleChangeCarryForwardText = (index: number, text: string) => {
    const items = [...currentReview.carryForwardItems];
    items[index] = { ...items[index], text };
    onUpdateState(updateGoalMonthReview(state, selectedArea, selectedMonth, { carryForwardItems: items }));
  };

  const handleAddCarryForwardItem = () => {
    const items = [
      ...currentReview.carryForwardItems,
      { id: Date.now().toString(), text: '', completed: false },
    ];
    onUpdateState(updateGoalMonthReview(state, selectedArea, selectedMonth, { carryForwardItems: items }));
  };

  const updateReflection = (key: 'oneWin' | 'oneLesson' | 'gratefulFor', text: string) => {
    onUpdateState(
      updateGoalMonthReview(state, selectedArea, selectedMonth, {
        reflection: {
          ...currentReview.reflection,
          [key]: text,
        },
      })
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FloralHeader
        title="Month in review"
        subtitle={`Reviewing: ${MONTH_NAMES[selectedMonth - 1]}`}
        year={state.year}
      />

      <GoalScopeHeader
        selectedArea={selectedArea}
        onSelectArea={onSelectArea}
        goalText={currentGoal.text}
        monthName={MONTH_NAMES[selectedMonth - 1]}
      />

      {/* Month picker chips */}
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

      <View style={styles.innerContent}>
        {/* Section 1: What I achieved */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Trophy size={17} color={THEME.colors.secondary} />
            <Text style={styles.cardTitle}>What I achieved</Text>
          </View>
          <TextInput
            value={currentReview.whatIAchieved}
            onChangeText={handleUpdateAchieved}
            placeholder={`Celebrate milestones and habits achieved for ${selectedArea}...`}
            placeholderTextColor={THEME.colors.textLight}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
        </View>

        {/* Section 2: What was left undone */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AlertCircle size={17} color={THEME.colors.accentGold} />
            <Text style={styles.cardTitle}>What was left undone</Text>
          </View>
          <TextInput
            value={currentReview.whatWasLeftUndone}
            onChangeText={handleUpdateUndone}
            placeholder="Acknowledge with self-compassion what didn't get finished..."
            placeholderTextColor={THEME.colors.textLight}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
        </View>

        {/* Section 3: What got in the way */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <HelpCircle size={17} color={THEME.colors.primary} />
            <Text style={styles.cardTitle}>What got in the way</Text>
          </View>
          <TextInput
            value={currentReview.whatGotInTheWay}
            onChangeText={handleUpdateGotInTheWay}
            placeholder="Obstacles, energy dips, time crunches, or unclear priorities..."
            placeholderTextColor={THEME.colors.textLight}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
        </View>

        {/* Section 4: What am I carrying forward to the next month */}
        <View style={styles.card}>
          <View style={styles.headerBetween}>
            <View style={styles.cardHeader}>
              <ArrowRightLeft size={17} color={THEME.colors.textDark} />
              <Text style={styles.cardTitle}>What am I carrying forward to next month</Text>
            </View>
            <Pressable
              onPress={handleAddCarryForwardItem}
              style={styles.addItemBtn}
              hitSlop={6}
            >
              <Plus size={14} color={THEME.colors.primary} />
              <Text style={styles.addItemText}>Add</Text>
            </Pressable>
          </View>
          <View style={styles.list}>
            {currentReview.carryForwardItems.map((item, idx) => (
              <CheckboxItem
                key={item.id || idx}
                text={item.text}
                completed={item.completed}
                placeholder={`Carry forward item #${idx + 1}...`}
                onToggle={() => handleToggleCarryForward(idx)}
                onChangeText={(t) => handleChangeCarryForwardText(idx, t)}
              />
            ))}
          </View>
        </View>

        {/* Section 5: Reflection */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Sparkles size={17} color={THEME.colors.primary} />
            <Text style={styles.cardTitle}>Reflection</Text>
          </View>

          <View style={styles.reflectionRows}>
            <View style={styles.reflectionField}>
              <Text style={styles.reflectionLabel}>One win</Text>
              <TextInput
                value={currentReview.reflection.oneWin}
                onChangeText={(t) => updateReflection('oneWin', t)}
                placeholder="The single victory I am most proud of in this area..."
                placeholderTextColor={THEME.colors.textLight}
                style={styles.singleLineInput}
              />
            </View>

            <View style={styles.reflectionField}>
              <Text style={styles.reflectionLabel}>One lesson</Text>
              <TextInput
                value={currentReview.reflection.oneLesson}
                onChangeText={(t) => updateReflection('oneLesson', t)}
                placeholder="The core insight I learned..."
                placeholderTextColor={THEME.colors.textLight}
                style={styles.singleLineInput}
              />
            </View>

            <View style={styles.reflectionField}>
              <Text style={styles.reflectionLabel}>Grateful for</Text>
              <TextInput
                value={currentReview.reflection.gratefulFor}
                onChangeText={(t) => updateReflection('gratefulFor', t)}
                placeholder="What or who supported me in this journey..."
                placeholderTextColor={THEME.colors.textLight}
                style={styles.singleLineInput}
              />
            </View>
          </View>
        </View>
      </View>

      <QuoteFooter
        quote={JOURNAL_QUOTES.monthReview.text}
        author={JOURNAL_QUOTES.monthReview.author}
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
  headerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.linedPaper,
    paddingBottom: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.textDark,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: THEME.colors.primaryLight,
    borderRadius: 8,
  },
  addItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  textArea: {
    fontSize: 14,
    lineHeight: 22,
    color: THEME.colors.textDark,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  list: {
    gap: 2,
  },
  reflectionRows: {
    gap: 12,
    marginTop: 6,
  },
  reflectionField: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.linedPaper,
    paddingBottom: 6,
  },
  reflectionLabel: {
    fontSize: 13,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginBottom: 2,
  },
  singleLineInput: {
    fontSize: 13.5,
    color: THEME.colors.textDark,
    paddingVertical: 2,
  },
});
