import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { JournalState, CheckItem, QuarterPlan } from '../types/journal';
import { THEME } from '../constants/theme';
import { FloralHeader } from '../components/FloralHeader';
import { QuoteFooter } from '../components/QuoteFooter';
import { CheckboxItem } from '../components/CheckboxItem';
import { JOURNAL_QUOTES } from '../constants/quotes';
import { MONTH_NAMES } from '../storage/journalStorage';
import { Compass, Calendar, ArrowRight, Plus } from 'lucide-react-native';

interface QuarterPlanScreenProps {
  state: JournalState;
  onUpdateState: (newState: JournalState) => void;
  selectedQuarter: 1 | 2 | 3 | 4;
  onSelectQuarter: (q: 1 | 2 | 3 | 4) => void;
  onSelectMonth?: (mIndex: number) => void;
}

export const QuarterPlanScreen: React.FC<QuarterPlanScreenProps> = ({
  state,
  onUpdateState,
  selectedQuarter,
  onSelectQuarter,
  onSelectMonth,
}) => {
  const currentPlan: QuarterPlan = state.quarterPlans[selectedQuarter] || {
    quarter: selectedQuarter,
    theme: '',
    month1: [
      { id: '1', text: '', completed: false },
      { id: '2', text: '', completed: false },
      { id: '3', text: '', completed: false },
    ],
    month2: [
      { id: '1', text: '', completed: false },
      { id: '2', text: '', completed: false },
      { id: '3', text: '', completed: false },
    ],
    month3: [
      { id: '1', text: '', completed: false },
      { id: '2', text: '', completed: false },
      { id: '3', text: '', completed: false },
    ],
  };

  const updateQuarterPlan = (updates: Partial<QuarterPlan>) => {
    const updated = {
      ...state.quarterPlans,
      [selectedQuarter]: {
        ...currentPlan,
        ...updates,
      },
    };
    onUpdateState({ ...state, quarterPlans: updated });
  };

  const startMonthIndex = (selectedQuarter - 1) * 3 + 1; // 1, 4, 7, 10
  const quarterMonthLabels = [
    { key: 'month1' as const, mIndex: startMonthIndex, label: MONTH_NAMES[startMonthIndex - 1] },
    { key: 'month2' as const, mIndex: startMonthIndex + 1, label: MONTH_NAMES[startMonthIndex] },
    { key: 'month3' as const, mIndex: startMonthIndex + 2, label: MONTH_NAMES[startMonthIndex + 1] },
  ];

  const handleToggleItem = (monthKey: 'month1' | 'month2' | 'month3', index: number) => {
    const items = [...currentPlan[monthKey]];
    items[index] = { ...items[index], completed: !items[index].completed };
    updateQuarterPlan({ [monthKey]: items });
  };

  const handleChangeItemText = (
    monthKey: 'month1' | 'month2' | 'month3',
    index: number,
    text: string
  ) => {
    const items = [...currentPlan[monthKey]];
    items[index] = { ...items[index], text };
    updateQuarterPlan({ [monthKey]: items });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FloralHeader
        title={`Quarter ${selectedQuarter} plan`}
        subtitle="Break down the quarter into high-impact monthly targets"
        year={state.year}
      />

      {/* Quarter Tab Selector */}
      <View style={styles.quarterTabs}>
        {([1, 2, 3, 4] as const).map((q) => {
          const isActive = q === selectedQuarter;
          return (
            <Pressable
              key={q}
              onPress={() => onSelectQuarter(q)}
              style={[styles.quarterTab, isActive && styles.quarterTabActive]}
            >
              <Text style={[styles.quarterTabText, isActive && styles.quarterTabTextActive]}>
                Quarter {q}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.innerContent}>
        {/* Quarter Theme */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Compass size={17} color={THEME.colors.primary} />
            <Text style={styles.cardTitle}>Quarter theme</Text>
          </View>
          <TextInput
            value={currentPlan.theme}
            onChangeText={(t) => updateQuarterPlan({ theme: t })}
            placeholder="e.g. Foundation & Consistency, Expansion, Health Reset..."
            placeholderTextColor={THEME.colors.textLight}
            multiline
            numberOfLines={2}
            style={styles.themeInput}
          />
        </View>

        {/* 3 Months Sections */}
        {quarterMonthLabels.map(({ key, mIndex, label }, mOrder) => {
          const items = currentPlan[key] || [];
          return (
            <View key={key} style={styles.card}>
              <View style={styles.monthHeaderRow}>
                <View style={styles.monthTitleArea}>
                  <Calendar size={16} color={THEME.colors.secondary} />
                  <Text style={styles.monthTitle}>
                    Month {mOrder + 1} <Text style={styles.monthSubtitle}>({label})</Text>
                  </Text>
                </View>
                {onSelectMonth && (
                  <Pressable
                    onPress={() => onSelectMonth(mIndex)}
                    style={styles.openMonthButton}
                    hitSlop={6}
                  >
                    <Text style={styles.openMonthButtonText}>View Planner</Text>
                    <ArrowRight size={12} color={THEME.colors.primary} />
                  </Pressable>
                )}
              </View>

              <View style={styles.checkboxList}>
                {items.map((item, idx) => (
                  <CheckboxItem
                    key={item.id || idx}
                    text={item.text}
                    completed={item.completed}
                    placeholder={`Key focus for ${label} (target ${idx + 1})...`}
                    onToggle={() => handleToggleItem(key, idx)}
                    onChangeText={(t) => handleChangeItemText(key, idx, t)}
                  />
                ))}
              </View>
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
    backgroundColor: THEME.colors.background,
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
    borderRadius: THEME.radius.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  quarterTabActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  quarterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textDark,
  },
  quarterTabTextActive: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.textDark,
  },
  themeInput: {
    fontSize: 14,
    lineHeight: 22,
    color: THEME.colors.textDark,
    minHeight: 46,
    textAlignVertical: 'top',
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.linedPaper,
    paddingBottom: 6,
  },
  monthTitleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  monthTitle: {
    fontSize: 15,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.textDark,
  },
  monthSubtitle: {
    fontSize: 13,
    fontFamily: THEME.typography.fontFamilySans,
    fontWeight: '500',
    color: THEME.colors.textMuted,
  },
  openMonthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  openMonthButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  checkboxList: {
    gap: 2,
  },
});
