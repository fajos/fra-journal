import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { LifeArea, LIFE_AREAS, JournalState } from '../types/journal';
import { THEME } from '../constants/theme';
import { FloralHeader } from '../components/FloralHeader';
import { QuoteFooter } from '../components/QuoteFooter';
import { PrioritySelector } from '../components/PrioritySelector';
import { LifeBalanceRadar } from '../components/LifeBalanceRadar';
import { JOURNAL_QUOTES } from '../constants/quotes';
import { getLifeAreaIcon } from '../components/GoalScopeHeader';
import { hapticFeedback } from '../services/hapticsService';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Calendar,
  Clock,
  Layers,
  PieChart,
  LayoutGrid,
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
  const [viewMode, setViewMode] = useState<'cards' | 'radar'>('cards');

  const topThreeCount = Object.values(state.goals).filter((g) => g.isTopThree).length;

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FloralHeader
        title="My goals for the year"
        subtitle="Circle your top three"
        year={state.year}
      />

      {/* Top Banner with View Switcher */}
      <View style={styles.topBanner}>
        <View style={styles.bannerRow}>
          <View style={styles.counterBadge}>
            <CheckCircle2 size={15} color={THEME.colors.primary} />
            <Text style={styles.counterText}>
              Top 3 Goals: <Text style={styles.bold}>{topThreeCount}/3</Text>
            </Text>
          </View>

          {/* View Mode Toggle */}
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => handleSwitchMode('cards')}
              style={[styles.toggleBtn, viewMode === 'cards' && styles.toggleBtnActive]}
            >
              <LayoutGrid size={13} color={viewMode === 'cards' ? '#FFFFFF' : THEME.colors.textMuted} />
              <Text style={[styles.toggleBtnText, viewMode === 'cards' && styles.toggleBtnTextActive]}>
                Cards
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleSwitchMode('radar')}
              style={[styles.toggleBtn, viewMode === 'radar' && styles.toggleBtnActive]}
            >
              <PieChart size={13} color={viewMode === 'radar' ? '#FFFFFF' : THEME.colors.textMuted} />
              <Text style={[styles.toggleBtnText, viewMode === 'radar' && styles.toggleBtnTextActive]}>
                Life Wheel
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.bannerHint}>
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
                  goal.isTopThree && styles.cardTopThree,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    {getLifeAreaIcon(item.key, 18, THEME.colors.primary)}
                    <Text style={styles.cardTitle}>{item.label}</Text>
                  </View>
                  {goal.isTopThree && (
                    <View style={styles.starPill}>
                      <Text style={styles.starPillText}>★ Priority</Text>
                    </View>
                  )}
                </View>

                <TextInput
                  value={goal.text}
                  onChangeText={(t) => handleTextChange(item.key, t)}
                  placeholder={item.defaultPlaceholder}
                  placeholderTextColor={THEME.colors.textLight}
                  multiline
                  numberOfLines={3}
                  style={styles.cardInput}
                />

                <PrioritySelector
                  priority={goal.priority}
                  onChangePriority={(p) => handlePriorityChange(item.key, p)}
                  isTopThree={goal.isTopThree}
                  onToggleTopThree={() => handleToggleTopThree(item.key)}
                />

                {/* Navigation Action Pills for this Goal */}
                <View style={styles.actionPillsRow}>
                  <Pressable
                    onPress={() => onNavigateToBreakdown(item.key)}
                    style={styles.actionPillPrimary}
                    hitSlop={4}
                  >
                    <Layers size={12} color="#FFFFFF" />
                    <Text style={styles.actionPillPrimaryText}>Breakdown</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => onNavigateToQuarter(item.key, 1)}
                    style={styles.actionPillSecondary}
                    hitSlop={4}
                  >
                    <Compass size={12} color={THEME.colors.primary} />
                    <Text style={styles.actionPillSecondaryText}>Quarters</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => onNavigateToMonth(item.key, 1)}
                    style={styles.actionPillSecondary}
                    hitSlop={4}
                  >
                    <Calendar size={12} color={THEME.colors.secondary} />
                    <Text style={styles.actionPillSecondaryText}>Months</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => onNavigateToWeek(item.key, 1, 1)}
                    style={styles.actionPillSecondary}
                    hitSlop={4}
                  >
                    <Clock size={12} color={THEME.colors.textDark} />
                    <Text style={styles.actionPillSecondaryText}>Weeks</Text>
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
  topBanner: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: THEME.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
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
    color: THEME.colors.textDark,
  },
  bold: {
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F3EFEA',
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
  toggleBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  bannerHint: {
    fontSize: 12,
    color: THEME.colors.textMuted,
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
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: 14,
    ...THEME.shadow,
  },
  cardWide: {
    width: '48.5%',
  },
  cardTopThree: {
    borderColor: THEME.colors.primary,
    backgroundColor: '#FFFDFD',
    borderWidth: 1.5,
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
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.textDark,
  },
  starPill: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  starPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  cardInput: {
    fontSize: 13.5,
    lineHeight: 20,
    color: THEME.colors.textDark,
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
    borderTopColor: THEME.colors.linedPaper,
  },
  actionPillPrimary: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: THEME.colors.primary,
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
    backgroundColor: THEME.colors.primaryLight,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6D3D7',
  },
  actionPillSecondaryText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: THEME.colors.textDark,
  },
});
