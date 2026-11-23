import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Text, TextInput } from '../components/AppText';
import { JournalState, LifeArea, QuarterPlan } from '../types/journal';
import { useTheme } from '../context/ThemeContext';
import { FloralHeader } from '../components/FloralHeader';
import { QuoteFooter } from '../components/QuoteFooter';
import { CheckboxItem } from '../components/CheckboxItem';
import { GoalScopeHeader } from '../components/GoalScopeHeader';
import { JOURNAL_QUOTES } from '../constants/quotes';
import { MONTH_NAMES, updateGoalQuarter, getActiveGoalAreas } from '../storage/journalStorage';
import { Compass, Calendar, ArrowRight, Plus } from 'lucide-react-native';
import { hapticFeedback } from '../services/hapticsService';

interface QuarterPlanScreenProps {
  state: JournalState;
  onUpdateState: (newState: JournalState) => void;
  selectedArea: LifeArea;
  onSelectArea: (area: LifeArea) => void;
  selectedQuarter: 1 | 2 | 3 | 4;
  onSelectQuarter: (q: 1 | 2 | 3 | 4) => void;
  onSelectMonth: (area: LifeArea, mIndex: number) => void;
}

export const QuarterPlanScreen: React.FC<QuarterPlanScreenProps> = ({
  state,
  onUpdateState,
  selectedArea,
  onSelectArea,
  selectedQuarter,
  onSelectQuarter,
  onSelectMonth,
}) => {
  const { theme } = useTheme();
  const currentGoal = state.goals[selectedArea];
  if (!currentGoal) return null;

  const currentPlan: QuarterPlan = currentGoal.quarterPlans[selectedQuarter];
  if (!currentPlan) return null;

  const handleUpdateTheme = (themeText: string) => {
    onUpdateState(updateGoalQuarter(state, selectedArea, selectedQuarter, { theme: themeText }));
  };

  const startMonthIndex = (selectedQuarter - 1) * 3 + 1;
  const quarterMonthLabels = [
    { key: 'month1' as const, mIndex: startMonthIndex, label: MONTH_NAMES[startMonthIndex - 1] },
    { key: 'month2' as const, mIndex: startMonthIndex + 1, label: MONTH_NAMES[startMonthIndex] },
    { key: 'month3' as const, mIndex: startMonthIndex + 2, label: MONTH_NAMES[startMonthIndex + 1] },
  ];

  const handleToggleItem = (monthKey: 'month1' | 'month2' | 'month3', index: number) => {
    const items = [...currentPlan[monthKey]];
    items[index] = { ...items[index], completed: !items[index].completed };
    onUpdateState(updateGoalQuarter(state, selectedArea, selectedQuarter, { [monthKey]: items }));
  };

  const handleChangeItemText = (
    monthKey: 'month1' | 'month2' | 'month3',
    index: number,
    text: string
  ) => {
    const items = [...currentPlan[monthKey]];
    items[index] = { ...items[index], text };
    onUpdateState(updateGoalQuarter(state, selectedArea, selectedQuarter, { [monthKey]: items }));
  };

  const handleAddItem = (monthKey: 'month1' | 'month2' | 'month3') => {
    hapticFeedback.selection();
    const items = [...(currentPlan[monthKey] || [])];
    items.push({
      id: `qitem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      text: '',
      completed: false,
    });
    onUpdateState(updateGoalQuarter(state, selectedArea, selectedQuarter, { [monthKey]: items }));
  };

  const handleDeleteItem = (monthKey: 'month1' | 'month2' | 'month3', index: number) => {
    hapticFeedback.light();
    const items = [...(currentPlan[monthKey] || [])];
    items.splice(index, 1);
    onUpdateState(updateGoalQuarter(state, selectedArea, selectedQuarter, { [monthKey]: items }));
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <FloralHeader
        title={`Quarter ${selectedQuarter} plan`}
        subtitle={`Goal: ${selectedArea}`}
        year={state.year}
      />

      <GoalScopeHeader
        selectedArea={selectedArea}
        onSelectArea={onSelectArea}
        goalText={currentGoal.text}
        quarter={selectedQuarter}
        areas={getActiveGoalAreas(state)}
      />

      {/* Quarter Tab Selector */}
      <View style={styles.quarterTabs}>
        {([1, 2, 3, 4] as const).map((q) => {
          const isActive = q === selectedQuarter;
          return (
            <Pressable
              key={q}
              onPress={() => onSelectQuarter(q)}
              style={[
                styles.quarterTab,
                {
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.cardBackground,
                  borderColor: isActive ? theme.colors.primary : theme.colors.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.quarterTabText,
                  { color: isActive ? '#FFFFFF' : theme.colors.textDark },
                ]}
              >
                Quarter {q}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.innerContent}>
        {/* Quarter Theme */}
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
            <Compass size={17} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              Quarter theme
            </Text>
          </View>
          <TextInput
            value={currentPlan.theme}
            onChangeText={handleUpdateTheme}
            placeholder={`e.g. Focus theme for Q${selectedQuarter} (${selectedArea})...`}
            placeholderTextColor={theme.colors.textLight}
            multiline
            numberOfLines={3}
            style={[styles.themeInput, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySans }]}
          />
        </View>

        {/* 3 Months Sections */}
        {quarterMonthLabels.map(({ key, mIndex, label }, mOrder) => {
          const items = currentPlan[key] || [];
          return (
            <View
              key={key}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
            >
              <View style={[styles.monthHeaderRow, { borderBottomColor: theme.colors.linedPaper }]}>
                <View style={styles.monthTitleArea}>
                  <Calendar size={16} color={theme.colors.secondary} />
                  <Text style={[styles.monthTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
                    Month {mOrder + 1} <Text style={[styles.monthSubtitle, { color: theme.colors.textMuted }]}>({label})</Text>
                  </Text>
                </View>
                <Pressable
                  onPress={() => onSelectMonth(selectedArea, mIndex)}
                  style={styles.openMonthButton}
                  hitSlop={6}
                >
                  <Text style={[styles.openMonthButtonText, { color: theme.colors.primary }]}>View Planner</Text>
                  <ArrowRight size={12} color={theme.colors.primary} />
                </Pressable>
              </View>

              <View style={styles.checkboxList}>
                {items.map((item, idx) => (
                  <CheckboxItem
                    key={item.id || idx}
                    text={item.text}
                    completed={item.completed}
                    placeholder={`Key target #${idx + 1} for ${label}...`}
                    onToggle={() => handleToggleItem(key, idx)}
                    onChangeText={(t) => handleChangeItemText(key, idx, t)}
                    onDelete={() => handleDeleteItem(key, idx)}
                  />
                ))}
                {items.length === 0 && (
                  <Text style={[styles.emptyHint, { color: theme.colors.textMuted }]}>
                    No targets set for {label}. Tap Add Target below.
                  </Text>
                )}
              </View>

              <Pressable
                onPress={() => handleAddItem(key)}
                style={[styles.addItemBtn, { borderColor: theme.colors.cardBorder }]}
                hitSlop={6}
              >
                <Plus size={13} color={theme.colors.primary} />
                <Text style={[styles.addItemBtnText, { color: theme.colors.primary }]}>
                  Add Target for {label}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <QuoteFooter
        quote={JOURNAL_QUOTES.quarterPlan.text}
        author={JOURNAL_QUOTES.quarterPlan.author}
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
  quarterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  quarterTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  quarterTabText: {
    fontSize: 13,
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
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  themeInput: {
    fontSize: 14,
    lineHeight: 22,
    minHeight: 56,
    textAlignVertical: 'top',
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  monthTitleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  monthSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  openMonthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  openMonthButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkboxList: {
    gap: 2,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addItemBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 12.5,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
});
