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
import { THEME } from '../constants/theme';
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
import { isBiometricsAvailable, authenticateWithBiometrics } from '../services/biometricsService';
import { exportJournalToPDF } from '../services/pdfExportService';
import { hapticFeedback } from '../services/hapticsService';
import {
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  Calendar,
  Printer,
  Check,
  ShieldCheck,
  Bell,
  Archive,
  Plus,
  Clock,
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
  const [jsonInput, setJsonInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Settings states
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FloralHeader
        title="Journal Settings & Premium"
        subtitle="Manage rolling years, reminders, biometrics, and backups"
        year={state.year}
      />

      <View style={styles.innerContent}>
        {/* Status Alert */}
        {statusMessage && (
          <View style={styles.statusBox}>
            <Check size={16} color={THEME.colors.success} />
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}

        {/* Rolling 4-Year Window Setting */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={18} color={THEME.colors.primary} />
            <Text style={styles.cardTitle}>Active 4-Year Rolling Window</Text>
          </View>
          <Text style={styles.cardDesc}>
            Your journal maintains an automatic 4-year rolling window centered on today. As years advance (e.g. after 2028 &rarr; 2029), the window automatically advances and older years are preserved in your archive.
          </Text>

          <View style={styles.yearRow}>
            {rollingYears.map((yr) => (
              <Pressable
                key={yr}
                onPress={() => handleSelectYear(yr)}
                style={[styles.yearChip, state.year === yr && styles.yearChipActive]}
              >
                <Text style={[styles.yearChipText, state.year === yr && styles.yearChipTextActive]}>
                  {yr}
                </Text>
                {state.year === yr && <View style={styles.activeDot} />}
              </Pressable>
            ))}
          </View>

          {/* Add Future Year / Custom Year */}
          <View style={styles.customYearRow}>
            <TextInput
              value={customYearInput}
              onChangeText={setCustomYearInput}
              placeholder="e.g. 2029"
              placeholderTextColor={THEME.colors.textLight}
              keyboardType="numeric"
              maxLength={4}
              style={styles.customYearInput}
            />
            <Pressable onPress={handleAddCustomYear} style={styles.addYearBtn}>
              <Plus size={14} color="#FFFFFF" />
              <Text style={styles.addYearBtnText}>Open Year</Text>
            </Pressable>
          </View>

          {/* Historical Archive Drawer */}
          {archivedYears.length > 0 && (
            <View style={styles.archiveSection}>
              <View style={styles.archiveHeader}>
                <Archive size={14} color={THEME.colors.primary} />
                <Text style={styles.archiveTitle}>Historical Years Archive</Text>
              </View>
              <Text style={styles.archiveHint}>
                Past years that have rolled forward are preserved here forever:
              </Text>
              <View style={styles.archivePills}>
                {archivedYears.map((ayr) => (
                  <Pressable
                    key={ayr}
                    onPress={() => handleSelectYear(ayr)}
                    style={[styles.archivePill, state.year === ayr && styles.archivePillActive]}
                  >
                    <Text style={[styles.archivePillText, state.year === ayr && styles.archivePillTextActive]}>
                      {ayr} Journal
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Biometric Privacy Lock */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ShieldCheck size={18} color={THEME.colors.primary} />
            <Text style={styles.cardTitle}>Biometric Privacy Lock</Text>
          </View>
          <Text style={styles.cardDesc}>
            Keep your deeply personal thoughts, finances, and reflections private with FaceID, TouchID, or Passcode on app launch.
          </Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Require Biometric Unlock</Text>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: THEME.colors.linedPaper, true: THEME.colors.primaryLight }}
              thumbColor={biometricEnabled ? THEME.colors.primary : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Automated Cadence Reminders */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Bell size={18} color={THEME.colors.primary} />
            <Text style={styles.cardTitle}>Cadence Reminders & Habits</Text>
          </View>
          <Text style={styles.cardDesc}>
            Stay accountable with timed prompts on your phone or web browser.
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.switchMeta}>
              <Text style={styles.switchLabel}>Sunday Weekly Planning (7:00 PM)</Text>
              <Text style={styles.switchSub}>Nudge to review prior week and set Top 3 priorities</Text>
            </View>
            <Switch
              value={sundayCadence}
              onValueChange={handleToggleSundayCadence}
              trackColor={{ false: THEME.colors.linedPaper, true: THEME.colors.primaryLight }}
              thumbColor={sundayCadence ? THEME.colors.primary : '#FFFFFF'}
            />
          </View>

          <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: THEME.colors.linedPaper }]}>
            <View style={styles.switchMeta}>
              <Text style={styles.switchLabel}>Month-End Review Nudge</Text>
              <Text style={styles.switchSub}>Prompts you to reflect on achievements and carry forwards</Text>
            </View>
            <Switch
              value={monthEndCadence}
              onValueChange={handleToggleMonthEndCadence}
              trackColor={{ false: THEME.colors.linedPaper, true: THEME.colors.primaryLight }}
              thumbColor={monthEndCadence ? THEME.colors.primary : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Export Keepsake PDF Booklet */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Printer size={18} color={THEME.colors.secondary} />
            <Text style={styles.cardTitle}>Printable PDF Annual Keepsake</Text>
          </View>
          <Text style={styles.cardDesc}>
            Generate an editorial-grade, printable PDF book of your {state.year} goals, milestones, and reflections.
          </Text>
          <Pressable onPress={handleExportPDF} style={styles.buttonPrimary}>
            <Printer size={15} color="#FFFFFF" />
            <Text style={styles.buttonPrimaryText}>Generate {state.year} PDF Keepsake</Text>
          </Pressable>
        </View>

        {/* Backup & Restore */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Download size={18} color={THEME.colors.primary} />
            <Text style={styles.cardTitle}>Offline Data Backup (JSON)</Text>
          </View>
          <Text style={styles.cardDesc}>
            All years and nested goals are stored 100% locally and privately on this device.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable onPress={handleExport} style={styles.buttonSecondary}>
              <Download size={14} color={THEME.colors.textDark} />
              <Text style={styles.buttonSecondaryText}>Export Backup</Text>
            </Pressable>
            <Pressable onPress={handleImport} style={styles.buttonSecondary}>
              <Upload size={14} color={THEME.colors.textDark} />
              <Text style={styles.buttonSecondaryText}>Restore Backup</Text>
            </Pressable>
          </View>

          <TextInput
            value={jsonInput}
            onChangeText={setJsonInput}
            placeholder="Paste backup JSON here to restore, or view exported JSON..."
            placeholderTextColor={THEME.colors.textLight}
            multiline
            numberOfLines={4}
            style={styles.jsonBox}
          />
        </View>

        {/* Reset */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <RotateCcw size={18} color={THEME.colors.danger} />
            <Text style={styles.cardTitle}>Reset Journal</Text>
          </View>
          <Text style={styles.cardDesc}>
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
    backgroundColor: THEME.colors.background,
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
    borderRadius: THEME.radius.sm,
    marginBottom: 14,
  },
  statusText: {
    fontSize: 13,
    color: THEME.colors.success,
    fontWeight: '600',
    flex: 1,
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
  cardDesc: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
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
    borderRadius: THEME.radius.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    position: 'relative',
  },
  yearChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  yearChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textDark,
  },
  yearChipTextActive: {
    color: '#FFFFFF',
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
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: THEME.colors.linedPaper,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 13,
    color: THEME.colors.textDark,
  },
  addYearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.primary,
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
    borderTopColor: THEME.colors.linedPaper,
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
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  archiveHint: {
    fontSize: 11.5,
    color: THEME.colors.textMuted,
    marginBottom: 8,
  },
  archivePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  archivePill: {
    backgroundColor: '#FCFAF7',
    borderWidth: 1,
    borderColor: THEME.colors.linedPaper,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  archivePillActive: {
    backgroundColor: THEME.colors.primaryLight,
    borderColor: THEME.colors.primary,
  },
  archivePillText: {
    fontSize: 11.5,
    color: THEME.colors.textDark,
    fontWeight: '500',
  },
  archivePillTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
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
    color: THEME.colors.textDark,
  },
  switchSub: {
    fontSize: 11.5,
    color: THEME.colors.textMuted,
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
    backgroundColor: THEME.colors.primary,
    paddingVertical: 11,
    borderRadius: THEME.radius.sm,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingVertical: 10,
    borderRadius: THEME.radius.sm,
  },
  buttonSecondaryText: {
    color: THEME.colors.textDark,
    fontSize: 13,
    fontWeight: '600',
  },
  jsonBox: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: THEME.colors.linedPaper,
    borderRadius: THEME.radius.sm,
    padding: 10,
    fontSize: 12,
    fontFamily: 'monospace',
    color: THEME.colors.textDark,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: THEME.colors.danger,
    paddingVertical: 10,
    borderRadius: THEME.radius.sm,
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
