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
import { useTheme } from '../context/ThemeContext';
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
  const { theme } = useTheme();
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
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

      <View style={styles.innerContent}>
        {/* Section 1: What I achieved */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Trophy size={17} color={theme.colors.secondary} />
            <Text
              style={[
                styles.cardTitle,
                {
                  color: theme.colors.textDark,
                  fontFamily: theme.typography.fontFamilySerif,
                },
              ]}
            >
              What I achieved
            </Text>
          </View>
          <TextInput
            value={currentReview.whatIAchieved}
            onChangeText={handleUpdateAchieved}
            placeholder={`Celebrate milestones and habits achieved for ${selectedArea}...`}
            placeholderTextColor={theme.colors.textLight}
            multiline
            numberOfLines={3}
            style={[styles.textArea, { color: theme.colors.textDark }]}
          />
        </View>

        {/* Section 2: What was left undone */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <AlertCircle size={17} color={theme.colors.accentGold} />
            <Text
              style={[
                styles.cardTitle,
                {
                  color: theme.colors.textDark,
                  fontFamily: theme.typography.fontFamilySerif,
                },
              ]}
            >
              What was left undone
            </Text>
          </View>
          <TextInput
            value={currentReview.whatWasLeftUndone}
            onChangeText={handleUpdateUndone}
            placeholder="Acknowledge with self-compassion what didn't get finished..."
            placeholderTextColor={theme.colors.textLight}
            multiline
            numberOfLines={3}
            style={[styles.textArea, { color: theme.colors.textDark }]}
          />
        </View>

        {/* Section 3: What got in the way */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <HelpCircle size={17} color={theme.colors.primary} />
            <Text
              style={[
                styles.cardTitle,
                {
                  color: theme.colors.textDark,
                  fontFamily: theme.typography.fontFamilySerif,
                },
              ]}
            >
              What got in the way
            </Text>
          </View>
          <TextInput
            value={currentReview.whatGotInTheWay}
            onChangeText={handleUpdateGotInTheWay}
            placeholder="Obstacles, energy dips, time crunches, or unclear priorities..."
            placeholderTextColor={theme.colors.textLight}
            multiline
            numberOfLines={3}
            style={[styles.textArea, { color: theme.colors.textDark }]}
          />
        </View>

        {/* Section 4: What am I carrying forward to the next month */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={[styles.headerBetween, { borderBottomColor: theme.colors.linedPaper }]}>
            <View style={styles.cardHeader}>
              <ArrowRightLeft size={17} color={theme.colors.textDark} />
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: theme.colors.textDark,
                    fontFamily: theme.typography.fontFamilySerif,
                  },
                ]}
              >
                What am I carrying forward to next month
              </Text>
            </View>
            <Pressable
              onPress={handleAddCarryForwardItem}
              style={[styles.addItemBtn, { backgroundColor: theme.colors.primaryLight }]}
              hitSlop={6}
            >
              <Plus size={14} color={theme.colors.primary} />
              <Text style={[styles.addItemText, { color: theme.colors.primary }]}>Add</Text>
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
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Sparkles size={17} color={theme.colors.primary} />
            <Text
              style={[
                styles.cardTitle,
                {
                  color: theme.colors.textDark,
                  fontFamily: theme.typography.fontFamilySerif,
                },
              ]}
            >
              Reflection
            </Text>
          </View>

          <View style={styles.reflectionRows}>
            <View style={[styles.reflectionField, { borderBottomColor: theme.colors.linedPaper }]}>
              <Text
                style={[
                  styles.reflectionLabel,
                  {
                    color: theme.colors.primary,
                    fontFamily: theme.typography.fontFamilySerif,
                  },
                ]}
              >
                One win
              </Text>
              <TextInput
                value={currentReview.reflection.oneWin}
                onChangeText={(t) => updateReflection('oneWin', t)}
                placeholder="The single victory I am most proud of in this area..."
                placeholderTextColor={theme.colors.textLight}
                style={[styles.singleLineInput, { color: theme.colors.textDark }]}
              />
            </View>

            <View style={[styles.reflectionField, { borderBottomColor: theme.colors.linedPaper }]}>
              <Text
                style={[
                  styles.reflectionLabel,
                  {
                    color: theme.colors.primary,
                    fontFamily: theme.typography.fontFamilySerif,
                  },
                ]}
              >
                One lesson
              </Text>
              <TextInput
                value={currentReview.reflection.oneLesson}
                onChangeText={(t) => updateReflection('oneLesson', t)}
                placeholder="The core insight I learned..."
                placeholderTextColor={theme.colors.textLight}
                style={[styles.singleLineInput, { color: theme.colors.textDark }]}
              />
            </View>

            <View style={[styles.reflectionField, { borderBottomColor: theme.colors.linedPaper }]}>
              <Text
                style={[
                  styles.reflectionLabel,
                  {
                    color: theme.colors.primary,
                    fontFamily: theme.typography.fontFamilySerif,
                  },
                ]}
              >
                Grateful for
              </Text>
              <TextInput
                value={currentReview.reflection.gratefulFor}
                onChangeText={(t) => updateReflection('gratefulFor', t)}
                placeholder="What or who supported me in this journey..."
                placeholderTextColor={theme.colors.textLight}
                style={[styles.singleLineInput, { color: theme.colors.textDark }]}
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
  innerContent: {
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  headerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
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
    fontWeight: '700',
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  addItemText: {
    fontSize: 11,
    fontWeight: '600',
  },
  textArea: {
    fontSize: 14,
    lineHeight: 22,
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
    paddingBottom: 6,
  },
  reflectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  singleLineInput: {
    fontSize: 13.5,
    paddingVertical: 2,
  },
});
