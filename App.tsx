import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ActivityIndicator,
  Text,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { JournalState, LifeArea } from './src/types/journal';
import {
  loadJournalState,
  saveJournalState,
  createInitialJournalState,
} from './src/storage/journalStorage';
import { THEME } from './src/constants/theme';
import { JournalNavBar, TabKey } from './src/navigation/JournalNavBar';

// Screens
import { YearGoalsScreen } from './src/screens/YearGoalsScreen';
import { GoalBreakdownScreen } from './src/screens/GoalBreakdownScreen';
import { QuarterPlanScreen } from './src/screens/QuarterPlanScreen';
import { MonthPlanScreen } from './src/screens/MonthPlanScreen';
import { WeekPlanScreen } from './src/screens/WeekPlanScreen';
import { MonthReviewScreen } from './src/screens/MonthReviewScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<JournalState>(createInitialJournalState());
  const [currentTab, setCurrentTab] = useState<TabKey>('goals');

  // Sub-selection state
  const [selectedArea, setSelectedArea] = useState<LifeArea>('Personal growth');
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  const saveTimeoutRef = useRef<any>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 800;

  useEffect(() => {
    async function initialize() {
      const loaded = await loadJournalState();
      setState(loaded);
      setLoading(false);
    }
    initialize();
  }, []);

  const handleUpdateState = (newState: JournalState) => {
    setState(newState);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveJournalState(newState);
    }, 500);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Opening your journal...</Text>
      </View>
    );
  }

  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'goals':
        return (
          <YearGoalsScreen
            state={state}
            onUpdateState={handleUpdateState}
            onSelectGoalBreakdown={(area) => {
              setSelectedArea(area);
              setCurrentTab('breakdown');
            }}
          />
        );
      case 'breakdown':
        return (
          <GoalBreakdownScreen
            state={state}
            onUpdateState={handleUpdateState}
            selectedArea={selectedArea}
            onSelectArea={setSelectedArea}
            onNavigateToQuarter={(q) => {
              setSelectedQuarter(q);
              setCurrentTab('quarters');
            }}
          />
        );
      case 'quarters':
        return (
          <QuarterPlanScreen
            state={state}
            onUpdateState={handleUpdateState}
            selectedQuarter={selectedQuarter}
            onSelectQuarter={setSelectedQuarter}
            onSelectMonth={(m) => {
              setSelectedMonth(m);
              setCurrentTab('months');
            }}
          />
        );
      case 'months':
        return (
          <MonthPlanScreen
            state={state}
            onUpdateState={handleUpdateState}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onNavigateToWeek={() => setCurrentTab('week')}
            onNavigateToReview={() => setCurrentTab('review')}
          />
        );
      case 'week':
        return (
          <WeekPlanScreen
            state={state}
            onUpdateState={handleUpdateState}
          />
        );
      case 'review':
        return (
          <MonthReviewScreen
            state={state}
            onUpdateState={handleUpdateState}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            state={state}
            onUpdateState={handleUpdateState}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.outerContainer}>
        <View style={[styles.mainWrapper, isDesktop && styles.mainWrapperDesktop]}>
          <View style={styles.screenContainer}>{renderActiveScreen()}</View>
          <JournalNavBar currentTab={currentTab} onSelectTab={setCurrentTab} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#F3EFEA', // Subtle desk/tabletop contrast for web/desktop
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: THEME.colors.background,
  },
  mainWrapperDesktop: {
    maxWidth: 820,
    height: '96%',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    overflow: 'hidden',
    ...THEME.shadow,
    marginVertical: 12,
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: THEME.typography.fontFamilySerif,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
  },
});
