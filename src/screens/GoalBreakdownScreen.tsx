import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
  Alert,
  Platform,
} from 'react-native';
import { LifeArea, JournalState } from '../types/journal';
import { useTheme } from '../context/ThemeContext';
import { FloralHeader } from '../components/FloralHeader';
import { QuoteFooter } from '../components/QuoteFooter';
import { GoalScopeHeader } from '../components/GoalScopeHeader';
import { ReminderModal } from '../components/ReminderModal';
import { ReflectivePromptsModal } from '../components/ReflectivePromptsModal';
import { JOURNAL_QUOTES } from '../constants/quotes';
import { hapticFeedback } from '../services/hapticsService';
import { getActiveGoalAreas, deleteGoal } from '../storage/journalStorage';
import {
  ChevronRight,
  Target,
  Sparkles,
  HeartHandshake,
  Layers,
  Bell,
  HelpCircle,
  Trash2,
} from 'lucide-react-native';
import { AiDecomposeModal } from '../components/AiDecomposeModal';
import { applyDecompositionToGoal, DecomposedPlan } from '../services/aiDecomposeService';

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
  const { theme } = useTheme();

  // Modals state
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [activeMilestoneTitle, setActiveMilestoneTitle] = useState('');
  const [promptsModalVisible, setPromptsModalVisible] = useState(false);
  const [promptContext, setPromptContext] = useState<'whyItMatters' | 'supportNeeded'>('whyItMatters');
  const [showAiModal, setShowAiModal] = useState(false);

  const handleApplyDecomposition = (plan: DecomposedPlan) => {
    if (!currentGoal) return;
    const updated = applyDecompositionToGoal(currentGoal, plan, state.year);
    const updatedGoals = {
      ...state.goals,
      [selectedArea]: updated,
    };
    onUpdateState({
      ...state,
      goals: updatedGoals,
      yearsData: {
        ...(state.yearsData || {}),
        [state.year]: updatedGoals,
      },
    });
  };

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

  const handleDeleteThisGoal = () => {
    hapticFeedback.medium();
    const title = `Delete "${selectedArea}" Goal?`;
    const message = `This will permanently erase "${selectedArea}" and all associated quarterly milestones, monthly targets, weekly actions, and daily plans for ${state.year}. This action cannot be undone.`;

    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) {
        const remaining = Object.keys(state.goals).filter((k) => k !== selectedArea);
        const updated = deleteGoal(state, selectedArea);
        onUpdateState(updated);
        if (remaining.length > 0) {
          onSelectArea(remaining[0] as LifeArea);
        }
      }
    } else {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            const remaining = Object.keys(state.goals).filter((k) => k !== selectedArea);
            const updated = deleteGoal(state, selectedArea);
            onUpdateState(updated);
            if (remaining.length > 0) {
              onSelectArea(remaining[0] as LifeArea);
            }
          },
        },
      ]);
    }
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <FloralHeader
        title="Goal breakdown"
        subtitle={`Area: ${selectedArea}`}
        year={state.year}
      />

      <GoalScopeHeader
        selectedArea={selectedArea}
        onSelectArea={onSelectArea}
        goalText={currentGoal.text}
        areas={getActiveGoalAreas(state)}
      />

      <View style={styles.formContainer}>
        {/* Section 1: My Goal */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.headerBetween}>
            <View style={styles.sectionHeader}>
              <Target size={17} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
                My goal
              </Text>
            </View>
            <Pressable
              onPress={() => setShowAiModal(true)}
              style={[styles.aiPill, { backgroundColor: theme.colors.primaryLight }]}
              hitSlop={6}
            >
              <Sparkles size={12} color="#D97706" />
              <Text style={[styles.aiPillText, { color: theme.colors.primary }]}>✨ Auto-Decompose with AI</Text>
            </Pressable>
          </View>
          <TextInput
            value={currentGoal.text}
            onChangeText={(t) => updateCurrentGoal({ text: t })}
            placeholder="What specific goal do you want to achieve in this area?"
            placeholderTextColor={theme.colors.textLight}
            multiline
            numberOfLines={2}
            style={[styles.textInput, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySans }]}
          />
        </View>

        {/* Section 2: Why it matters to me */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.headerBetween}>
            <View style={styles.sectionHeader}>
              <Sparkles size={17} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
                Why it matters to me
              </Text>
            </View>
            <Pressable
              onPress={() => handleOpenPrompts('whyItMatters')}
              style={[styles.promptHelperBtn, { backgroundColor: theme.colors.primaryLight }]}
              hitSlop={6}
            >
              <HelpCircle size={13} color={theme.colors.primary} />
              <Text style={[styles.promptHelperText, { color: theme.colors.primary }]}>Prompts</Text>
            </Pressable>
          </View>
          <TextInput
            value={currentGoal.whyItMatters}
            onChangeText={(t) => updateCurrentGoal({ whyItMatters: t })}
            placeholder="Connect with your deeper purpose: why is achieving this essential to your life?"
            placeholderTextColor={theme.colors.textLight}
            multiline
            numberOfLines={3}
            style={[styles.textInput, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySans }]}
          />
        </View>

        {/* Section 3: Milestones (Quarterly 2x2 Grid) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Layers size={17} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              Milestones
            </Text>
          </View>
          <Text style={[styles.sectionHint, { color: theme.colors.textMuted }]}>
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
                style={[
                  styles.quarterBox,
                  isWide && styles.quarterBoxWide,
                  {
                    backgroundColor: theme.isDark ? '#23232A' : '#FCFAF7',
                    borderColor: theme.colors.linedPaper,
                  },
                ]}
              >
                <View style={[styles.quarterHeader, { borderBottomColor: theme.colors.linedPaper }]}>
                  <Text style={[styles.quarterTitle, { color: theme.colors.primary, fontFamily: theme.typography.fontFamilySerif }]}>
                    {label}
                  </Text>
                  <View style={styles.quarterActionGroup}>
                    <Pressable
                      onPress={() => handleOpenReminder(currentGoal.milestones[key] || `${label} Milestone`)}
                      hitSlop={6}
                      style={styles.reminderIconBtn}
                    >
                      <Bell size={12} color={theme.colors.textMuted} />
                    </Pressable>
                    <Pressable
                      onPress={() => onNavigateToQuarter(selectedArea, num)}
                      hitSlop={6}
                      style={styles.quarterLink}
                    >
                      <Text style={[styles.quarterLinkText, { color: theme.colors.primary }]}>Plan Q{num}</Text>
                      <ChevronRight size={12} color={theme.colors.primary} />
                    </Pressable>
                  </View>
                </View>
                <TextInput
                  value={currentGoal.milestones[key]}
                  onChangeText={(t) => handleMilestoneChange(key, t)}
                  placeholder={`Milestones for ${label}...`}
                  placeholderTextColor={theme.colors.textLight}
                  multiline
                  numberOfLines={4}
                  style={[styles.quarterInput, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySans }]}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Section 4: Support I need */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.headerBetween}>
            <View style={styles.sectionHeader}>
              <HeartHandshake size={17} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
                Support I need
              </Text>
            </View>
            <Pressable
              onPress={() => handleOpenPrompts('supportNeeded')}
              style={[styles.promptHelperBtn, { backgroundColor: theme.colors.primaryLight }]}
              hitSlop={6}
            >
              <HelpCircle size={13} color={theme.colors.primary} />
              <Text style={[styles.promptHelperText, { color: theme.colors.primary }]}>Prompts</Text>
            </Pressable>
          </View>
          <TextInput
            value={currentGoal.supportNeeded}
            onChangeText={(t) => updateCurrentGoal({ supportNeeded: t })}
            placeholder="Who can keep you accountable? What tools, books, mentors, or habits do you need?"
            placeholderTextColor={theme.colors.textLight}
            multiline
            numberOfLines={3}
            style={[styles.textInput, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySans }]}
          />
        </View>

        {/* Delete Goal and Associated Plans Button */}
        <Pressable
          onPress={handleDeleteThisGoal}
          style={[
            styles.deleteGoalCardBtn,
            { backgroundColor: theme.isDark ? '#2E1518' : '#FEF2F2', borderColor: '#FCA5A5' },
          ]}
        >
          <Trash2 size={15} color="#DC2626" />
          <Text style={styles.deleteGoalCardBtnText}>
            Delete "{selectedArea}" &amp; All Associated Plans
          </Text>
        </Pressable>
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

      {/* AI Decomposition Modal */}
      <AiDecomposeModal
        visible={showAiModal}
        onClose={() => setShowAiModal(false)}
        area={selectedArea}
        initialGoalText={currentGoal.text || ''}
        year={state.year}
        onApply={handleApplyDecomposition}
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
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  formContainer: {
    paddingHorizontal: 16,
    marginTop: 6,
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
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  promptHelperBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  promptHelperText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHint: {
    fontSize: 12,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  textInput: {
    fontSize: 14,
    lineHeight: 22,
    minHeight: 64,
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
    borderRadius: 8,
    borderWidth: 1,
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
    paddingBottom: 4,
  },
  quarterTitle: {
    fontSize: 13,
    fontWeight: '700',
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
    fontWeight: '600',
  },
  quarterInput: {
    fontSize: 13,
    lineHeight: 20,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  deleteGoalCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 6,
  },
  deleteGoalCardBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
});
