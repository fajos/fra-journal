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
import { LifeArea, JournalState } from '../types/journal';
import { THEME } from '../constants/theme';
import { FloralHeader } from '../components/FloralHeader';
import { QuoteFooter } from '../components/QuoteFooter';
import { GoalScopeHeader } from '../components/GoalScopeHeader';
import { ReminderModal } from '../components/ReminderModal';
import { ReflectivePromptsModal } from '../components/ReflectivePromptsModal';
import { JOURNAL_QUOTES } from '../constants/quotes';
import { hapticFeedback } from '../services/hapticsService';
import {
  ChevronRight,
  Target,
  Sparkles,
  HeartHandshake,
  Layers,
  Bell,
  HelpCircle,
} from 'lucide-react-native';

interface GoalBreakdownScreenProps {
  state: JournalState;
  onUpdateState: (newState: JournalState) => void;
  selectedArea: LifeArea;
  onSelectArea: (area: LifeArea) => void;
  onNavigateToQuarter: (area: LifeArea, quarter: 1 | 2 | 3 | 4) => void;
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

  // Modals state
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [activeMilestoneTitle, setActiveMilestoneTitle] = useState('');
  const [promptsModalVisible, setPromptsModalVisible] = useState(false);
  const [promptContext, setPromptContext] = useState<'whyItMatters' | 'supportNeeded'>('whyItMatters');

  const currentGoal = state.goals[selectedArea];
  if (!currentGoal) return null;

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

  const handleOpenReminder = (title: string) => {
    hapticFeedback.light();
    setActiveMilestoneTitle(title || `Milestone for ${selectedArea}`);
    setReminderModalVisible(true);
  };

  const handleOpenPrompts = (type: 'whyItMatters' | 'supportNeeded') => {
    hapticFeedback.light();
    setPromptContext(type);
    setPromptsModalVisible(true);
  };

  const handleInsertPrompt = (prompt: string) => {
    if (promptContext === 'whyItMatters') {
      const existing = currentGoal.whyItMatters ? `${currentGoal.whyItMatters}\n\n` : '';
      updateCurrentGoal({ whyItMatters: `${existing}${prompt}` });
    } else {
      const existing = currentGoal.supportNeeded ? `${currentGoal.supportNeeded}\n\n` : '';
      updateCurrentGoal({ supportNeeded: `${existing}${prompt}` });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FloralHeader
        title="Goal breakdown"
        subtitle={`Area: ${selectedArea}`}
        year={state.year}
      />

      <GoalScopeHeader
        selectedArea={selectedArea}
        onSelectArea={onSelectArea}
        goalText={currentGoal.text}
      />

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
          <View style={styles.headerBetween}>
            <View style={styles.sectionHeader}>
              <Sparkles size={17} color={THEME.colors.primary} />
              <Text style={styles.sectionTitle}>Why it matters to me</Text>
            </View>
            <Pressable
              onPress={() => handleOpenPrompts('whyItMatters')}
              style={styles.promptHelperBtn}
              hitSlop={6}
            >
              <HelpCircle size={13} color={THEME.colors.primary} />
              <Text style={styles.promptHelperText}>Prompts</Text>
            </Pressable>
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
            Break down this goal into quarterly targets with optional date reminders:
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
                  <View style={styles.quarterActionGroup}>
                    <Pressable
                      onPress={() => handleOpenReminder(currentGoal.milestones[key] || `${label} Milestone`)}
                      hitSlop={6}
                      style={styles.reminderIconBtn}
                    >
                      <Bell size={12} color={THEME.colors.textMuted} />
                    </Pressable>
                    <Pressable
                      onPress={() => onNavigateToQuarter(selectedArea, num)}
                      hitSlop={6}
                      style={styles.quarterLink}
                    >
                      <Text style={styles.quarterLinkText}>Plan Q{num}</Text>
                      <ChevronRight size={12} color={THEME.colors.primary} />
                    </Pressable>
                  </View>
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
          <View style={styles.headerBetween}>
            <View style={styles.sectionHeader}>
              <HeartHandshake size={17} color={THEME.colors.primary} />
              <Text style={styles.sectionTitle}>Support I need</Text>
            </View>
            <Pressable
              onPress={() => handleOpenPrompts('supportNeeded')}
              style={styles.promptHelperBtn}
              hitSlop={6}
            >
              <HelpCircle size={13} color={THEME.colors.primary} />
              <Text style={styles.promptHelperText}>Prompts</Text>
            </Pressable>
          </View>
          <TextInput
            value={currentGoal.supportNeeded}
            onChangeText={(t) => updateCurrentGoal({ supportNeeded: t })}
            placeholder="Who can keep you accountable? What tools, books, mentors, or habits do you need?"
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

      {/* Reminder Scheduling Modal */}
      <ReminderModal
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
        milestoneTitle={activeMilestoneTitle}
        goalArea={selectedArea}
      />

      {/* Reflective Prompts Modal */}
      <ReflectivePromptsModal
        visible={promptsModalVisible}
        onClose={() => setPromptsModalVisible(false)}
        contextType={promptContext}
        onSelectPrompt={handleInsertPrompt}
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
  headerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.textDark,
  },
  promptHelperBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  promptHelperText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.primary,
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
  quarterActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderIconBtn: {
    padding: 2,
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
