import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { LifeArea, LIFE_AREAS, JournalState } from '../types/journal';
import { useTheme } from '../context/ThemeContext';
import { FloralHeader } from '../components/FloralHeader';
import { QuoteFooter } from '../components/QuoteFooter';
import { PrioritySelector } from '../components/PrioritySelector';
import { LifeBalanceRadar } from '../components/LifeBalanceRadar';
import { JOURNAL_QUOTES } from '../constants/quotes';
import { getLifeAreaIcon } from '../components/GoalScopeHeader';
import { hapticFeedback } from '../services/hapticsService';
import { getRollingYears, switchJournalYear } from '../storage/journalStorage';
import {
  CheckCircle2,
  Compass,
  Calendar,
  Clock,
  Layers,
  PieChart,
  LayoutGrid,
  X,
  Archive,
} from 'lucide-react-native';

interface YearGoalsScreenProps {
  state: JournalState;
  onUpdateState: (newState: JournalState) => void;
  onNavigateToBreakdown: (area: LifeArea) => void;
  onNavigateToQuarter: (area: LifeArea, quarter: 1 | 2 | 3 | 4) => void;
  onNavigateToMonth: (area: LifeArea, month: number) => void;
  onNavigateToWeek: (area: LifeArea, month: number, week: number) => void;
}

export const YearGoalsScreen: React.FC<YearGoalsScreenProps> = ({
  state,
  onUpdateState,
  onNavigateToBreakdown,
  onNavigateToQuarter,
  onNavigateToMonth,
  onNavigateToWeek,
}) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'cards' | 'radar'>('cards');

  const [showYearPickerModal, setShowYearPickerModal] = useState(false);
  const [customYearInput, setCustomYearInput] = useState('');

  const rollingYears = getRollingYears();
  const storedYears = Object.keys(state.yearsData || {}).map((y) => parseInt(y, 10));
  const archivedYears = storedYears.filter((y) => !rollingYears.includes(y)).sort((a, b) => b - a);

  const topThreeCount = Object.values(state.goals).filter((g) => g.isTopThree).length;

  const handleSelectYear = (targetYear: number) => {
    hapticFeedback.selection();
    const updated = switchJournalYear(state, targetYear);
    onUpdateState(updated);
    setShowYearPickerModal(false);
  };

  const handleAddCustomYear = () => {
    const parsed = parseInt(customYearInput.trim(), 10);
    if (!isNaN(parsed) && parsed >= 2000 && parsed <= 2100) {
      handleSelectYear(parsed);
      setCustomYearInput('');
    }
  };

  const handleTextChange = (area: LifeArea, text: string) => {
    const updatedGoals = {
      ...state.goals,
      [area]: {
        ...state.goals[area],
        text,
      },
    };
    onUpdateState({ ...state, goals: updatedGoals });
  };

  const handlePriorityChange = (area: LifeArea, priority: 1 | 2 | 3) => {
    const updatedGoals = {
      ...state.goals,
      [area]: {
        ...state.goals[area],
        priority,
      },
    };
    onUpdateState({ ...state, goals: updatedGoals });
  };

  const handleToggleTopThree = (area: LifeArea) => {
    const current = state.goals[area].isTopThree;
    const updatedGoals = {
      ...state.goals,
      [area]: {
        ...state.goals[area],
        isTopThree: !current,
      },
    };
    onUpdateState({ ...state, goals: updatedGoals });
  };

  const handleSwitchMode = (mode: 'cards' | 'radar') => {
    hapticFeedback.selection();
    setViewMode(mode);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <FloralHeader
        title="My goals for the year"
        subtitle="Circle your top three"
        year={state.year}
        onPressYear={() => setShowYearPickerModal(true)}
      />

      {/* Top Banner with View Switcher */}
      <View
        style={[
          styles.topBanner,
          {
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder,
          },
        ]}
      >
        <View style={styles.bannerRow}>
          <View style={styles.counterBadge}>
            <CheckCircle2 size={15} color={theme.colors.primary} />
            <Text style={[styles.counterText, { color: theme.colors.textDark }]}>
              Top 3 Goals: <Text style={[styles.bold, { color: theme.colors.primary }]}>{topThreeCount}/3</Text>
            </Text>
          </View>

          {/* View Mode Toggle */}
          <View style={[styles.toggleRow, { backgroundColor: theme.colors.linedPaper }]}>
            <Pressable
              onPress={() => handleSwitchMode('cards')}
              style={[
                styles.toggleBtn,
                viewMode === 'cards' && { backgroundColor: theme.colors.primary },
              ]}
            >
              <LayoutGrid size={13} color={viewMode === 'cards' ? '#FFFFFF' : theme.colors.textMuted} />
              <Text
                style={[
                  styles.toggleBtnText,
                  { color: viewMode === 'cards' ? '#FFFFFF' : theme.colors.textMuted },
                ]}
              >
                Cards
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleSwitchMode('radar')}
              style={[
                styles.toggleBtn,
                viewMode === 'radar' && { backgroundColor: theme.colors.primary },
              ]}
            >
              <PieChart size={13} color={viewMode === 'radar' ? '#FFFFFF' : theme.colors.textMuted} />
              <Text
                style={[
                  styles.toggleBtnText,
                  { color: viewMode === 'radar' ? '#FFFFFF' : theme.colors.textMuted },
                ]}
              >
                Life Wheel
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.bannerHint, { color: theme.colors.textMuted }]}>
          {viewMode === 'cards'
            ? 'Each life area cascades into quarterly, monthly, and weekly plans.'
            : 'Track overall balance and momentum across your 8 life areas.'}
        </Text>
      </View>

      {/* Render Life Balance Wheel or Cards Grid */}
      {viewMode === 'radar' ? (
        <LifeBalanceRadar
          state={state}
          onSelectArea={(area) => onNavigateToBreakdown(area)}
        />
      ) : (
        <View style={[styles.grid, isWide && styles.gridWide]}>
          {LIFE_AREAS.map((item) => {
            const goal = state.goals[item.key];
            if (!goal) return null;

            return (
              <View
                key={item.key}
                style={[
                  styles.card,
                  isWide && styles.cardWide,
                  {
                    backgroundColor: theme.colors.cardBackground,
                    borderColor: goal.isTopThree ? theme.colors.primary : theme.colors.cardBorder,
                    borderWidth: goal.isTopThree ? 1.5 : 1,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    {getLifeAreaIcon(item.key, 18, theme.colors.primary)}
                    <Text
                      style={[
                        styles.cardTitle,
                        {
                          color: theme.colors.textDark,
                          fontFamily: theme.typography.fontFamilySerif,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  {goal.isTopThree && (
                    <View style={[styles.starPill, { backgroundColor: theme.colors.primaryLight }]}>
                      <Text style={[styles.starPillText, { color: theme.colors.primary }]}>★ Priority</Text>
                    </View>
                  )}
                </View>

                <TextInput
                  value={goal.text}
                  onChangeText={(t) => handleTextChange(item.key, t)}
                  placeholder={item.defaultPlaceholder}
                  placeholderTextColor={theme.colors.textLight}
                  multiline
                  numberOfLines={3}
                  style={[styles.cardInput, { color: theme.colors.textDark }]}
                />

                <PrioritySelector
                  priority={goal.priority}
                  onChangePriority={(p) => handlePriorityChange(item.key, p)}
                  isTopThree={goal.isTopThree}
                  onToggleTopThree={() => handleToggleTopThree(item.key)}
                />

                {/* Navigation Action Pills for this Goal */}
                <View style={[styles.actionPillsRow, { borderTopColor: theme.colors.linedPaper }]}>
                  <Pressable
                    onPress={() => onNavigateToBreakdown(item.key)}
                    style={[styles.actionPillPrimary, { backgroundColor: theme.colors.primary }]}
                    hitSlop={4}
                  >
                    <Layers size={12} color="#FFFFFF" />
                    <Text style={styles.actionPillPrimaryText}>Breakdown</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => onNavigateToQuarter(item.key, 1)}
                    style={[
                      styles.actionPillSecondary,
                      {
                        backgroundColor: theme.colors.primaryLight,
                        borderColor: theme.colors.cardBorder,
                      },
                    ]}
                    hitSlop={4}
                  >
                    <Compass size={12} color={theme.colors.primary} />
                    <Text style={[styles.actionPillSecondaryText, { color: theme.colors.textDark }]}>Quarters</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => onNavigateToMonth(item.key, 1)}
                    style={[
                      styles.actionPillSecondary,
                      {
                        backgroundColor: theme.colors.primaryLight,
                        borderColor: theme.colors.cardBorder,
                      },
                    ]}
                    hitSlop={4}
                  >
                    <Calendar size={12} color={theme.colors.secondary} />
                    <Text style={[styles.actionPillSecondaryText, { color: theme.colors.textDark }]}>Months</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => onNavigateToWeek(item.key, 1, 1)}
                    style={[
                      styles.actionPillSecondary,
                      {
                        backgroundColor: theme.colors.primaryLight,
                        borderColor: theme.colors.cardBorder,
                      },
                    ]}
                    hitSlop={4}
                  >
                    <Clock size={12} color={theme.colors.textDark} />
                    <Text style={[styles.actionPillSecondaryText, { color: theme.colors.textDark }]}>Weeks</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <QuoteFooter
        quote={JOURNAL_QUOTES.yearGoals.text}
        author={JOURNAL_QUOTES.yearGoals.author}
      />

      {/* Year Picker Modal */}
      <Modal visible={showYearPickerModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Calendar size={18} color={theme.colors.primary} />
                <Text
                  style={[
                    styles.modalTitle,
                    { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif },
                  ]}
                >
                  Switch Journal Year
                </Text>
              </View>
              <Pressable onPress={() => setShowYearPickerModal(false)} hitSlop={8}>
                <X size={18} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <Text style={[styles.modalDesc, { color: theme.colors.textMuted }]}>
              Select any year to review past journals or plan upcoming seasons:
            </Text>

            {/* Rolling 4 Years Section */}
            <Text style={[styles.modalSectionLabel, { color: theme.colors.primary }]}>
              Rolling 4-Year Window
            </Text>
            <View style={styles.modalGrid}>
              {rollingYears.map((yr) => {
                const isAct = yr === state.year;
                const isNow = yr === new Date().getFullYear();
                return (
                  <Pressable
                    key={yr}
                    onPress={() => handleSelectYear(yr)}
                    style={[
                      styles.modalYearBtn,
                      {
                        backgroundColor: isAct ? theme.colors.primary : theme.colors.primaryLight,
                        borderColor: isAct ? theme.colors.primary : theme.colors.cardBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalYearBtnText,
                        { color: isAct ? '#FFFFFF' : theme.colors.textDark },
                      ]}
                    >
                      {yr}
                    </Text>
                    {isNow && (
                      <Text
                        style={[
                          styles.modalNowText,
                          { color: isAct ? '#FFFFFF' : theme.colors.primary },
                        ]}
                      >
                        (Current)
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Archived Years Section (if any) */}
            {archivedYears.length > 0 && (
              <>
                <View style={styles.modalArchiveHeader}>
                  <Archive size={13} color={theme.colors.textMuted} />
                  <Text style={[styles.modalSectionLabel, { color: theme.colors.textMuted }]}>
                    Archived Journals
                  </Text>
                </View>
                <View style={styles.modalGrid}>
                  {archivedYears.map((yr) => (
                    <Pressable
                      key={yr}
                      onPress={() => handleSelectYear(yr)}
                      style={[
                        styles.modalYearBtn,
                        {
                          backgroundColor:
                            yr === state.year ? theme.colors.primary : theme.colors.linedPaper,
                          borderColor: theme.colors.cardBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalYearBtnText,
                          { color: yr === state.year ? '#FFFFFF' : theme.colors.textDark },
                        ]}
                      >
                        {yr}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {/* Custom Year Input */}
            <View style={[styles.customYearRow, { borderTopColor: theme.colors.linedPaper }]}>
              <TextInput
                value={customYearInput}
                onChangeText={setCustomYearInput}
                placeholder="Or enter year (e.g. 2029)..."
                placeholderTextColor={theme.colors.textLight}
                keyboardType="numeric"
                maxLength={4}
                style={[
                  styles.customYearInput,
                  {
                    color: theme.colors.textDark,
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
              />
              <Pressable
                onPress={handleAddCustomYear}
                style={[styles.jumpBtn, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={styles.jumpBtnText}>Jump</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  modalYearBtn: {
    flexGrow: 1,
    flexBasis: '22%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  modalYearBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalNowText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  modalArchiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  customYearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  customYearInput: {
    flex: 1,
    fontSize: 13.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  jumpBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  jumpBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  topBanner: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  counterText: {
    fontSize: 13,
  },
  bold: {
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bannerHint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  grid: {
    paddingHorizontal: 16,
    gap: 14,
  },
  gridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  cardWide: {
    width: '48.5%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  starPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  starPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardInput: {
    fontSize: 13.5,
    lineHeight: 20,
    minHeight: 58,
    textAlignVertical: 'top',
    paddingVertical: 4,
  },
  actionPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  actionPillPrimary: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionPillPrimaryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionPillSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionPillSecondaryText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
});
