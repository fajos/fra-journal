import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalState } from '../types/journal';
import { THEMES, ThemeKey } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { FloralHeader } from '../components/FloralHeader';
import {
  resetJournalState,
  switchJournalYear,
  getRollingYears,
} from '../storage/journalStorage';
import {
  scheduleWeeklyPlanningCadence,
  scheduleMonthlyReviewCadence,
} from '../services/notificationService';
import {
  isBiometricsAvailable,
  authenticateWithBiometrics,
  getBiometricLabel,
} from '../services/biometricsService';
import { exportJournalToPDF } from '../services/pdfExportService';
import { hapticFeedback } from '../services/hapticsService';
import {
  Download,
  Upload,
  RotateCcw,
  Calendar,
  Printer,
  Check,
  ShieldCheck,
  Bell,
  Archive,
  Plus,
  Palette,
  Sun,
  Moon,
  Feather,
} from 'lucide-react-native';

const BIOMETRIC_KEY = '@ejournal_biometric_enabled';
const CADENCE_SUNDAY_KEY = '@ejournal_cadence_sunday';
const CADENCE_MONTH_KEY = '@ejournal_cadence_month';

interface SettingsScreenProps {
  state: JournalState;
  onUpdateState: (newState: JournalState) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  state,
  onUpdateState,
}) => {
  const { theme, themeKey, setThemeKey } = useTheme();
  const [jsonInput, setJsonInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Settings states
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometrics');
  const [sundayCadence, setSundayCadence] = useState(true);
  const [monthEndCadence, setMonthEndCadence] = useState(true);
  const [customYearInput, setCustomYearInput] = useState('');

  const rollingYears = getRollingYears();
  const allStoredYears = Object.keys(state.yearsData || {}).map((y) => parseInt(y, 10));
  const archivedYears = allStoredYears
    .filter((y) => !rollingYears.includes(y))
    .sort((a, b) => b - a);

  useEffect(() => {
    async function checkPrefs() {
      const bioAvail = await isBiometricsAvailable();
      setBiometricsAvailable(bioAvail);
      const label = await getBiometricLabel();
      setBiometricLabel(label);
      const bioPref = await AsyncStorage.getItem(BIOMETRIC_KEY);
      if (bioPref === 'true') setBiometricEnabled(true);

      const sunPref = await AsyncStorage.getItem(CADENCE_SUNDAY_KEY);
      if (sunPref !== null) setSundayCadence(sunPref === 'true');

      const monthPref = await AsyncStorage.getItem(CADENCE_MONTH_KEY);
      if (monthPref !== null) setMonthEndCadence(monthPref === 'true');
    }
    checkPrefs();
  }, []);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSelectYear = (targetYear: number) => {
    hapticFeedback.selection();
    const updated = switchJournalYear(state, targetYear);
    onUpdateState(updated);
    showStatus(`Switched active journal to ${targetYear}! All data preserved.`);
  };

  const handleAddCustomYear = () => {
    const yr = parseInt(customYearInput.trim(), 10);
    if (yr >= 2000 && yr <= 2100) {
      handleSelectYear(yr);
      setCustomYearInput('');
    } else {
      showStatus('Please enter a valid 4-digit year (e.g. 2029).');
    }
  };

  const handleToggleBiometrics = async (enabled: boolean) => {
    hapticFeedback.selection();
    if (enabled) {
      const authed = await authenticateWithBiometrics('Enable biometric security for your journal');
      if (authed) {
        setBiometricEnabled(true);
        await AsyncStorage.setItem(BIOMETRIC_KEY, 'true');
        showStatus('Biometric lock enabled! Your journal is now protected.');
      } else {
        showStatus('Biometric authentication failed.');
      }
    } else {
      setBiometricEnabled(false);
      await AsyncStorage.setItem(BIOMETRIC_KEY, 'false');
      showStatus('Biometric lock turned off.');
    }
  };

  const handleToggleSundayCadence = async (enabled: boolean) => {
    hapticFeedback.selection();
    setSundayCadence(enabled);
    await AsyncStorage.setItem(CADENCE_SUNDAY_KEY, enabled.toString());
    if (enabled) {
      await scheduleWeeklyPlanningCadence(19, 0);
      showStatus('Sunday 7:00 PM weekly planning reminder activated!');
    } else {
      showStatus('Sunday weekly reminder turned off.');
    }
  };

  const handleToggleMonthEndCadence = async (enabled: boolean) => {
    hapticFeedback.selection();
    setMonthEndCadence(enabled);
    await AsyncStorage.setItem(CADENCE_MONTH_KEY, enabled.toString());
    if (enabled) {
      await scheduleMonthlyReviewCadence(18, 0);
      showStatus('Month-end reflection reminder activated!');
    } else {
      showStatus('Month-end reminder turned off.');
    }
  };

  const handleExportPDF = async () => {
    hapticFeedback.medium();
    showStatus('Preparing your printable Annual Journal Booklet...');
    const result = await exportJournalToPDF(state);
    if (result) {
      hapticFeedback.success();
      showStatus('Annual Keepsake PDF generated successfully!');
    }
  };

  const handleExport = () => {
    hapticFeedback.light();
    const dataStr = JSON.stringify(state, null, 2);
    setJsonInput(dataStr);
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(dataStr);
      showStatus('Journal JSON copied to clipboard & loaded into box below!');
    } else {
      showStatus('Journal JSON loaded into box below. Copy to save!');
    }
  };

  const handleImport = () => {
    hapticFeedback.medium();
    if (!jsonInput.trim()) {
      showStatus('Please paste valid JSON data into the box first.');
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.goals) {
        onUpdateState(parsed);
        showStatus('Journal state successfully restored!');
      } else {
        showStatus('Invalid journal data structure.');
      }
    } catch (e) {
      showStatus('Error parsing JSON. Please check format.');
    }
  };

  const handleReset = async () => {
    hapticFeedback.medium();
    const fresh = await resetJournalState();
    onUpdateState(fresh);
    showStatus('Reset to fresh starter journal.');
  };

  const themeList: { key: ThemeKey; title: string; desc: string; icon: any }[] = [
    {
      key: 'warmPaper',
      title: 'Warm Linen Paper',
      desc: 'The original physical journal look with dusty rose and warm taupe tones.',
      icon: Feather,
    },
    {
      key: 'pureLight',
      title: 'Pure Minimalist Light',
      desc: 'Clean daylight white with crisp contrast and modern indigo accents.',
      icon: Sun,
    },
    {
      key: 'midnightDark',
      title: 'Midnight Velvet Dark',
      desc: 'Deep obsidian charcoal with luminous rose accents for calm evening writing.',
      icon: Moon,
    },
    {
      key: 'botanicalSage',
      title: 'Botanical Sage Calm',
      desc: 'Eucalyptus green and earthy tones inspired by nature and tranquility.',
      icon: Palette,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <FloralHeader
        title="Settings & Appearance"
        subtitle="Customize themes, rolling years, reminders, and biometrics"
        year={state.year}
      />

      <View style={styles.innerContent}>
        {/* Status Alert */}
        {statusMessage && (
          <View style={styles.statusBox}>
            <Check size={16} color={theme.colors.success} />
            <Text style={[styles.statusText, { color: theme.colors.success }]}>{statusMessage}</Text>
          </View>
        )}

        {/* Visual Theme Selector Card */}
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
            <Palette size={18} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              App Appearance & Theme
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
            Choose an aesthetic that matches your journaling mood:
          </Text>

          <View style={styles.themesGrid}>
            {themeList.map(({ key, title, desc, icon: IconComponent }) => {
              const itemTheme = THEMES[key];
              const isSelected = themeKey === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setThemeKey(key)}
                  style={[
                    styles.themeOptionCard,
                    {
                      backgroundColor: itemTheme.colors.background,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.cardBorder,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.themeOptionHeader}>
                    <View style={styles.themeTitleRow}>
                      <IconComponent size={15} color={itemTheme.colors.primary} />
                      <Text style={[styles.themeOptionTitle, { color: itemTheme.colors.textDark }]}>
                        {title}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.selectedCheck, { backgroundColor: theme.colors.primary }]}>
                        <Check size={11} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </View>

                  <Text style={[styles.themeOptionDesc, { color: itemTheme.colors.textMuted }]}>
                    {desc}
                  </Text>

                  {/* Palette Swatches */}
                  <View style={styles.swatchRow}>
                    <View style={[styles.swatch, { backgroundColor: itemTheme.colors.background }]} />
                    <View style={[styles.swatch, { backgroundColor: itemTheme.colors.primary }]} />
                    <View style={[styles.swatch, { backgroundColor: itemTheme.colors.secondary }]} />
                    <View style={[styles.swatch, { backgroundColor: itemTheme.colors.textDark }]} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Rolling 4-Year Window Setting */}
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
            <Calendar size={18} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              Active 4-Year Rolling Window
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
            Your journal automatically maintains an active 4-year rolling window. As years advance (e.g. after 2028 &rarr; 2029), older years are safely preserved in your archive.
          </Text>

          <View style={styles.yearRow}>
            {rollingYears.map((yr) => {
              const isAct = state.year === yr;
              return (
                <Pressable
                  key={yr}
                  onPress={() => handleSelectYear(yr)}
                  style={[
                    styles.yearChip,
                    {
                      backgroundColor: isAct ? theme.colors.primary : theme.colors.cardBackground,
                      borderColor: isAct ? theme.colors.primary : theme.colors.cardBorder,
                    },
                  ]}
                >
                  <Text style={[styles.yearChipText, { color: isAct ? '#FFFFFF' : theme.colors.textDark }]}>
                    {yr}
                  </Text>
                  {isAct && <View style={styles.activeDot} />}
                </Pressable>
              );
            })}
          </View>

          {/* Add Future Year / Custom Year */}
          <View style={styles.customYearRow}>
            <TextInput
              value={customYearInput}
              onChangeText={setCustomYearInput}
              placeholder="e.g. 2029"
              placeholderTextColor={theme.colors.textLight}
              keyboardType="numeric"
              maxLength={4}
              style={[
                styles.customYearInput,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.linedPaper,
                  color: theme.colors.textDark,
                },
              ]}
            />
            <Pressable
              onPress={handleAddCustomYear}
              style={[styles.addYearBtn, { backgroundColor: theme.colors.primary }]}
            >
              <Plus size={14} color="#FFFFFF" />
              <Text style={styles.addYearBtnText}>Open Year</Text>
            </Pressable>
          </View>

          {/* Historical Archive Drawer */}
          {archivedYears.length > 0 && (
            <View style={[styles.archiveSection, { borderTopColor: theme.colors.linedPaper }]}>
              <View style={styles.archiveHeader}>
                <Archive size={14} color={theme.colors.primary} />
                <Text style={[styles.archiveTitle, { color: theme.colors.primary }]}>Historical Years Archive</Text>
              </View>
              <Text style={[styles.archiveHint, { color: theme.colors.textMuted }]}>
                Past years that have rolled forward are preserved here forever:
              </Text>
              <View style={styles.archivePills}>
                {archivedYears.map((ayr) => (
                  <Pressable
                    key={ayr}
                    onPress={() => handleSelectYear(ayr)}
                    style={[
                      styles.archivePill,
                      {
                        backgroundColor: state.year === ayr ? theme.colors.primaryLight : theme.colors.cardBackground,
                        borderColor: state.year === ayr ? theme.colors.primary : theme.colors.cardBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.archivePillText,
                        {
                          color: state.year === ayr ? theme.colors.primary : theme.colors.textDark,
                          fontWeight: state.year === ayr ? '700' : '500',
                        },
                      ]}
                    >
                      {ayr} Journal
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Biometric Privacy Lock */}
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
            <ShieldCheck size={18} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              Biometric Privacy Lock
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
            Keep your deeply personal thoughts, finances, and reflections private with FaceID, TouchID, or Passcode on app launch.
          </Text>

          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.colors.textDark }]}>
              Require {biometricLabel} Unlock
            </Text>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: theme.colors.linedPaper, true: theme.colors.primaryLight }}
              thumbColor={biometricEnabled ? theme.colors.primary : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Automated Cadence Reminders */}
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
            <Bell size={18} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              Cadence Reminders & Habits
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
            Stay accountable with timed prompts on your phone or web browser.
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.switchMeta}>
              <Text style={[styles.switchLabel, { color: theme.colors.textDark }]}>Sunday Weekly Planning (7:00 PM)</Text>
              <Text style={[styles.switchSub, { color: theme.colors.textMuted }]}>Nudge to review prior week and set Top 3 priorities</Text>
            </View>
            <Switch
              value={sundayCadence}
              onValueChange={handleToggleSundayCadence}
              trackColor={{ false: theme.colors.linedPaper, true: theme.colors.primaryLight }}
              thumbColor={sundayCadence ? theme.colors.primary : '#FFFFFF'}
            />
          </View>

          <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: theme.colors.linedPaper }]}>
            <View style={styles.switchMeta}>
              <Text style={[styles.switchLabel, { color: theme.colors.textDark }]}>Month-End Review Nudge</Text>
              <Text style={[styles.switchSub, { color: theme.colors.textMuted }]}>Prompts you to reflect on achievements and carry forwards</Text>
            </View>
            <Switch
              value={monthEndCadence}
              onValueChange={handleToggleMonthEndCadence}
              trackColor={{ false: theme.colors.linedPaper, true: theme.colors.primaryLight }}
              thumbColor={monthEndCadence ? theme.colors.primary : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Export Keepsake PDF Booklet */}
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
            <Printer size={18} color={theme.colors.secondary} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              Printable PDF Annual Keepsake
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
            Generate an editorial-grade, printable PDF book of your {state.year} goals, milestones, and reflections.
          </Text>
          <Pressable
            onPress={handleExportPDF}
            style={[styles.buttonPrimary, { backgroundColor: theme.colors.primary }]}
          >
            <Printer size={15} color="#FFFFFF" />
            <Text style={styles.buttonPrimaryText}>Generate {state.year} PDF Keepsake</Text>
          </Pressable>
        </View>

        {/* Backup & Restore */}
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
            <Download size={18} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              Offline Data Backup (JSON)
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
            All years and nested goals are stored 100% locally and privately on this device.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleExport}
              style={[styles.buttonSecondary, { borderColor: theme.colors.cardBorder }]}
            >
              <Download size={14} color={theme.colors.textDark} />
              <Text style={[styles.buttonSecondaryText, { color: theme.colors.textDark }]}>Export Backup</Text>
            </Pressable>
            <Pressable
              onPress={handleImport}
              style={[styles.buttonSecondary, { borderColor: theme.colors.cardBorder }]}
            >
              <Upload size={14} color={theme.colors.textDark} />
              <Text style={[styles.buttonSecondaryText, { color: theme.colors.textDark }]}>Restore Backup</Text>
            </Pressable>
          </View>

          <TextInput
            value={jsonInput}
            onChangeText={setJsonInput}
            placeholder="Paste backup JSON here to restore, or view exported JSON..."
            placeholderTextColor={theme.colors.textLight}
            multiline
            numberOfLines={4}
            style={[
              styles.jsonBox,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.linedPaper,
                color: theme.colors.textDark,
              },
            ]}
          />
        </View>

        {/* Reset */}
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
            <RotateCcw size={18} color={theme.colors.danger} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              Reset Journal
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
            Reset all entries back to the clean starter template.
          </Text>
          <Pressable onPress={handleReset} style={styles.dangerButton}>
            <RotateCcw size={14} color="#FFFFFF" />
            <Text style={styles.dangerButtonText}>Reset to Default Starters</Text>
          </Pressable>
        </View>
      </View>
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
  innerContent: {
    paddingHorizontal: 16,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EBF4ED',
    borderWidth: 1,
    borderColor: '#C2E0C6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
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
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  themesGrid: {
    gap: 10,
  },
  themeOptionCard: {
    borderRadius: 10,
    padding: 12,
  },
  themeOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  themeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  themeOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectedCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 6,
  },
  swatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  yearRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  yearChip: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    position: 'relative',
  },
  yearChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  customYearRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  customYearInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 13,
  },
  addYearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  addYearBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  archiveSection: {
    marginTop: 10,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  archiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  archiveTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  archiveHint: {
    fontSize: 11.5,
    marginBottom: 8,
  },
  archivePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  archivePill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  archivePillText: {
    fontSize: 11.5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchMeta: {
    flex: 1,
    paddingRight: 10,
  },
  switchLabel: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  switchSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  buttonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 8,
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
  buttonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  jsonBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    fontFamily: 'monospace',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 8,
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
