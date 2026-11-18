import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalState, LifeArea } from './src/types/journal';
import {
  loadJournalState,
  saveJournalState,
  createInitialJournalState,
} from './src/storage/journalStorage';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
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

function AppContent() {
  const { theme, isDark } = useTheme();
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamilySerif }]}>
          Opening your journal...
        </Text>
      </View>
    );
  }

  if (locked) {
    return (
      <View style={[styles.lockedContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.lockBadge, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.cardBorder }]}>
          <Lock size={32} color={theme.colors.primary} />
        </View>
        <Text style={[styles.lockedTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
          Journal Protected
        </Text>
        <Text style={[styles.lockedSubtitle, { color: theme.colors.textMuted }]}>
          This private journal is locked with biometric security.
        </Text>
        <Pressable onPress={handleUnlock} style={[styles.unlockBtn, { backgroundColor: theme.colors.primary }]}>
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.outerContainer, { backgroundColor: theme.colors.deskBackground }]}>
        <View
          style={[
            styles.mainWrapper,
            { backgroundColor: theme.colors.background },
            isDesktop && [
              styles.mainWrapperDesktop,
              { borderColor: theme.colors.cardBorder },
            ],
          ]}
        >
          <View style={styles.screenContainer}>{renderActiveScreen()}</View>
          <JournalNavBar currentTab={currentTab} onSelectTab={handleTabChange} />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
  },
  mainWrapperDesktop: {
    maxWidth: 840,
    height: '96%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 12,
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  lockBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  lockedSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 280,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
