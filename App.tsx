import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ActivityIndicator,
  Text,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalState, LifeArea } from './src/types/journal';
import {
  loadJournalState,
  saveJournalState,
  createInitialJournalState,
} from './src/storage/journalStorage';
import { THEME } from './src/constants/theme';
import { JournalNavBar, TabKey } from './src/navigation/JournalNavBar';
import { authenticateWithBiometrics } from './src/services/biometricsService';
import { hapticFeedback } from './src/services/hapticsService';
import { ShieldCheck, Lock } from 'lucide-react-native';

// Screens
import { YearGoalsScreen } from './src/screens/YearGoalsScreen';
import { GoalBreakdownScreen } from './src/screens/GoalBreakdownScreen';
import { QuarterPlanScreen } from './src/screens/QuarterPlanScreen';
import { MonthPlanScreen } from './src/screens/MonthPlanScreen';
import { WeekPlanScreen } from './src/screens/WeekPlanScreen';
import { MonthReviewScreen } from './src/screens/MonthReviewScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const BIOMETRIC_KEY = '@ejournal_biometric_enabled';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [state, setState] = useState<JournalState>(createInitialJournalState());
  const [currentTab, setCurrentTab] = useState<TabKey>('goals');

  // Unified Scope Hierarchy: Goal Area -> Quarter -> Month -> Week
  const [selectedArea, setSelectedArea] = useState<LifeArea>('Personal growth');
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const saveTimeoutRef = useRef<any>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 800;

  useEffect(() => {
    async function initialize() {
      // Check biometric setting
      const bioPref = await AsyncStorage.getItem(BIOMETRIC_KEY);
      if (bioPref === 'true') {
        setLocked(true);
        const success = await authenticateWithBiometrics('Unlock your journal');
        if (success) {
          setLocked(false);
        }
      }

      const loaded = await loadJournalState();
      setState(loaded);
      setLoading(false);
    }
    initialize();
  }, []);

  const handleUnlock = async () => {
    hapticFeedback.medium();
    const success = await authenticateWithBiometrics('Unlock your journal');
    if (success) {
      hapticFeedback.success();
      setLocked(false);
    }
  };

  const handleUpdateState = (newState: JournalState) => {
    setState(newState);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveJournalState(newState);
    }, 500);
  };

  const handleTabChange = (tab: TabKey) => {
    hapticFeedback.light();
    setCurrentTab(tab);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Opening your journal...</Text>
      </View>
    );
  }

  if (locked) {
    return (
      <View style={styles.lockedContainer}>
        <View style={styles.lockBadge}>
          <Lock size={32} color={THEME.colors.primary} />
        </View>
        <Text style={styles.lockedTitle}>Journal Protected</Text>
        <Text style={styles.lockedSubtitle}>
          This private journal is locked with biometric security.
        </Text>
        <Pressable onPress={handleUnlock} style={styles.unlockBtn}>
          <ShieldCheck size={16} color="#FFFFFF" />
          <Text style={styles.unlockBtnText}>Unlock with Biometrics</Text>
        </Pressable>
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
            onNavigateToBreakdown={(area) => {
              setSelectedArea(area);
              setCurrentTab('breakdown');
            }}
            onNavigateToQuarter={(area, q) => {
              setSelectedArea(area);
              setSelectedQuarter(q);
              setCurrentTab('quarters');
            }}
            onNavigateToMonth={(area, m) => {
              setSelectedArea(area);
              setSelectedMonth(m);
              setCurrentTab('months');
            }}
            onNavigateToWeek={(area, m, w) => {
              setSelectedArea(area);
              setSelectedMonth(m);
              setSelectedWeek(w);
              setCurrentTab('week');
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
            onNavigateToQuarter={(area, q) => {
              setSelectedArea(area);
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
            selectedArea={selectedArea}
            onSelectArea={setSelectedArea}
            selectedQuarter={selectedQuarter}
            onSelectQuarter={setSelectedQuarter}
            onSelectMonth={(area, m) => {
              setSelectedArea(area);
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
            selectedArea={selectedArea}
            onSelectArea={setSelectedArea}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onNavigateToWeek={(area, m, w) => {
              setSelectedArea(area);
              setSelectedMonth(m);
              setSelectedWeek(w);
              setCurrentTab('week');
            }}
            onNavigateToReview={(area, m) => {
              setSelectedArea(area);
              setSelectedMonth(m);
              setCurrentTab('review');
            }}
          />
        );
      case 'week':
        return (
          <WeekPlanScreen
            state={state}
            onUpdateState={handleUpdateState}
            selectedArea={selectedArea}
            onSelectArea={setSelectedArea}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            selectedWeek={selectedWeek}
            onSelectWeek={setSelectedWeek}
          />
        );
      case 'review':
        return (
          <MonthReviewScreen
            state={state}
            onUpdateState={handleUpdateState}
            selectedArea={selectedArea}
            onSelectArea={setSelectedArea}
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
          <JournalNavBar currentTab={currentTab} onSelectTab={handleTabChange} />
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
    backgroundColor: '#F3EFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: THEME.colors.background,
  },
  mainWrapperDesktop: {
    maxWidth: 840,
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
  lockedContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  lockBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6D3D7',
  },
  lockedTitle: {
    fontSize: 22,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.textDark,
    marginBottom: 6,
  },
  lockedSubtitle: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 280,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.radius.sm,
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
