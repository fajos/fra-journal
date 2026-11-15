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
import { LifeArea, LIFE_AREAS, JournalState } from '../types/journal';
import { THEME } from '../constants/theme';
import { FloralHeader } from '../components/FloralHeader';
import { QuoteFooter } from '../components/QuoteFooter';
import { JOURNAL_QUOTES } from '../constants/quotes';
import { ChevronRight, Target, Sparkles, HeartHandshake, Layers } from 'lucide-react-native';

interface GoalBreakdownScreenProps {
  state: JournalState;
  onUpdateState: (newState: JournalState) => void;
  selectedArea: LifeArea;
  onSelectArea: (area: LifeArea) => void;
  onNavigateToQuarter?: (q: 1 | 2 | 3 | 4) => void;
}

export const GoalBreakdownScreen: React.FC<GoalBreakdownScreenProps> = ({
  state,
  onUpdateState,
  selectedArea,
  onSelectArea,
  onNavigateToQuarter,
}) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const currentGoal = state.goals[selectedArea] || {
    area: selectedArea,
    text: '',
    priority: 1,
    isTopThree: false,
    whyItMatters: '',
    milestones: { q1: '', q2: '', q3: '', q4: '' },
    supportNeeded: '',
  };

  const updateCurrentGoal = (updates: Partial<typeof currentGoal>) => {
    const updatedGoals = {
      ...state.goals,
      [selectedArea]: {
        ...currentGoal,
        ...updates,
      },
    };
    onUpdateState({ ...state, goals: updatedGoals });
  };

  const handleMilestoneChange = (qKey: 'q1' | 'q2' | 'q3' | 'q4', text: string) => {
    updateCurrentGoal({
      milestones: {
        ...currentGoal.milestones,
        [qKey]: text,
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FloralHeader
        title="Goal breakdown"
        subtitle={`Area: ${selectedArea}`}
        year={state.year}
      />

      {/* Horizontal Area Selector Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.areaScroll}
      >
        {LIFE_AREAS.map((item) => {
          const isActive = item.key === selectedArea;
          const hasGoal = !!state.goals[item.key]?.text;
          return (
            <Pressable
              key={item.key}
              onPress={() => onSelectArea(item.key)}
              style={[styles.areaChip, isActive && styles.areaChipActive]}
            >
              <Text style={[styles.areaChipText, isActive && styles.areaChipTextActive]}>
                {item.label}
              </Text>
              {hasGoal && <View style={[styles.activeDot, isActive && styles.activeDotWhite]} />}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.formContainer}>
        {/* Section 1: My Goal */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Target size={17} color={THEME.colors.primary} />
            <Text style={styles.sectionTitle}>My goal</Text>
          </View>
          <TextInput
            value={currentGoal.text}
            onChangeText={(t) => updateCurrentGoal({ text: t })}
            placeholder="What specific goal do you want to achieve in this area?"
            placeholderTextColor={THEME.colors.textLight}
            multiline
            numberOfLines={2}
            style={styles.textInput}
          />
        </View>

        {/* Section 2: Why it matters to me */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Sparkles size={17} color={THEME.colors.primary} />
            <Text style={styles.sectionTitle}>Why it matters to me</Text>
          </View>
          <TextInput
            value={currentGoal.whyItMatters}
            onChangeText={(t) => updateCurrentGoal({ whyItMatters: t })}
            placeholder="Connect with your deeper purpose: why is achieving this essential to your life?"
            placeholderTextColor={THEME.colors.textLight}
            multiline
            numberOfLines={3}
            style={styles.textInput}
          />
        </View>

        {/* Section 3: Milestones (Quarterly 2x2 Grid) */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Layers size={17} color={THEME.colors.primary} />
            <Text style={styles.sectionTitle}>Milestones</Text>
          </View>
          <Text style={styles.sectionHint}>
            Break down the annual goal into achievable quarterly checkpoints:
          </Text>

          <View style={[styles.milestoneGrid, isWide && styles.milestoneGridWide]}>
            {([
              { key: 'q1', num: 1, label: 'Quarter 1' },
              { key: 'q2', num: 2, label: 'Quarter 2' },
              { key: 'q3', num: 3, label: 'Quarter 3' },
              { key: 'q4', num: 4, label: 'Quarter 4' },
            ] as const).map(({ key, num, label }) => (
              <View
                key={key}
                style={[styles.quarterBox, isWide && styles.quarterBoxWide]}
              >
                <View style={styles.quarterHeader}>
                  <Text style={styles.quarterTitle}>{label}</Text>
                  {onNavigateToQuarter && (
                    <Pressable
                      onPress={() => onNavigateToQuarter(num)}
                      hitSlop={6}
                      style={styles.quarterLink}
                    >
                      <Text style={styles.quarterLinkText}>Plan Q{num}</Text>
                      <ChevronRight size={12} color={THEME.colors.primary} />
                    </Pressable>
                  )}
                </View>
                <TextInput
                  value={currentGoal.milestones[key]}
                  onChangeText={(t) => handleMilestoneChange(key, t)}
                  placeholder={`Milestones for ${label}...`}
                  placeholderTextColor={THEME.colors.textLight}
                  multiline
                  numberOfLines={3}
                  style={styles.quarterInput}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Section 4: Support I need */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <HeartHandshake size={17} color={THEME.colors.primary} />
            <Text style={styles.sectionTitle}>Support I need</Text>
          </View>
          <TextInput
            value={currentGoal.supportNeeded}
            onChangeText={(t) => updateCurrentGoal({ supportNeeded: t })}
            placeholder="Who can help keep you accountable? What tools, books, mentors, or habits do you need?"
            placeholderTextColor={THEME.colors.textLight}
            multiline
            numberOfLines={3}
            style={styles.textInput}
          />
        </View>
      </View>

      <QuoteFooter
        quote={JOURNAL_QUOTES.goalBreakdown.text}
        author={JOURNAL_QUOTES.goalBreakdown.author}
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
  areaScroll: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  areaChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  areaChipText: {
    fontSize: 12.5,
    fontFamily: THEME.typography.fontFamilySans,
    fontWeight: '600',
    color: THEME.colors.textDark,
  },
  areaChipTextActive: {
    color: '#FFFFFF',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: THEME.colors.primary,
  },
  activeDotWhite: {
    backgroundColor: '#FFFFFF',
  },
  formContainer: {
    paddingHorizontal: 16,
    marginTop: 6,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.textDark,
  },
  sectionHint: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  textInput: {
    fontSize: 14,
    lineHeight: 22,
    color: THEME.colors.textDark,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  milestoneGrid: {
    gap: 10,
  },
  milestoneGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quarterBox: {
    backgroundColor: '#FCFAF7',
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.linedPaper,
    padding: 10,
  },
  quarterBoxWide: {
    width: '48.5%',
  },
  quarterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.linedPaper,
    paddingBottom: 4,
  },
  quarterTitle: {
    fontSize: 13,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  quarterLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  quarterLinkText: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  quarterInput: {
    fontSize: 13,
    lineHeight: 19,
    color: THEME.colors.textDark,
    minHeight: 52,
    textAlignVertical: 'top',
  },
});
