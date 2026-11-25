import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { Text, TextInput } from '../components/AppText';
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
  ALargeSmall,
  Palette,
  Clock,
  Sun,
  Moon,
  Feather,
  Cloud,
  RefreshCw,
  LogIn,
  LogOut,
  Mail,
  Sparkles,
  Key,
  Globe,
  X,
  Trash2,
  CloudDownload,
  ExternalLink,
  Info,
  AlertTriangle,
} from 'lucide-react-native';
import {
  checkForAppUpdates,
  reloadAppAsync,
  getAppVersion,
} from '../services/updatesService';
import { Modal, ActivityIndicator } from 'react-native';
import {
  CloudUser,
  getCloudUser,
  cloudLogout,
  cloudDeleteAccount,
  syncWithCloud,
  refreshCloudUser,
} from '../services/cloudSyncService';
import {
  saveReminderSettings,
  sendTestReminder,
  fetchReminderSettings,
} from '../services/remindersService';
import {
  restoreUserPurchases,
  getSubscriptionStatusDetails,
  SubscriptionStatusDetails,
} from '../services/subscriptionService';
import { SubscriptionModal } from '../components/SubscriptionModal';

const BIOMETRIC_KEY = '@ejournal_biometric_enabled';
const CADENCE_SUNDAY_KEY = '@ejournal_cadence_sunday';
const CADENCE_MONTH_KEY = '@ejournal_cadence_month';

interface SettingsScreenProps {
  state: JournalState;
  onUpdateState: (newState: JournalState) => void;
  onLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  state,
  onUpdateState,
  onLogout,
}) => {
  const { theme, themeKey, setThemeKey, fontSizeKey, setFontSizeKey, fontSizeOptions } = useTheme();
  const [jsonInput, setJsonInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Settings states
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometrics');
  const [sundayCadence, setSundayCadence] = useState(true);
  const [monthEndCadence, setMonthEndCadence] = useState(true);
  const [customYearInput, setCustomYearInput] = useState('');

  // Cloud & Sync states
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  // Email Reminders states
  const [reminderFreq, setReminderFreq] = useState<'weekly' | 'daily' | 'monthly' | 'disabled'>('disabled');
  const [reminderDay, setReminderDay] = useState('Monday');
  const [reminderLoading, setReminderLoading] = useState(false);

  // Updates states
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  // Subscription states
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [restoringSubscription, setRestoringSubscription] = useState(false);
  const [subDetails, setSubDetails] = useState<SubscriptionStatusDetails | null>(null);

  // Safety Confirmation Modals
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  useEffect(() => {
    getSubscriptionStatusDetails(cloudUser).then(setSubDetails);
  }, [cloudUser]);

  const userIsPro = Boolean(subDetails?.isPro || cloudUser?.is_pro);

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

      const user = await getCloudUser();
      setCloudUser(user);

      if (user) {
        const rem = await fetchReminderSettings();
        if (rem) {
          if (userIsPro) {
            setReminderFreq(rem.frequency || 'disabled');
          } else {
            setReminderFreq('disabled');
          }
          setReminderDay(rem.day_of_week || 'Monday');
        } else {
          setReminderFreq('disabled');
        }
      } else {
        setReminderFreq('disabled');
      }
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
    if (Platform.OS === 'web') {
      showStatus("Device screen lock uses your phone's native Face ID, Touch ID, Fingerprint, or device PIN and is available on mobile.");
      return;
    }
    if (enabled) {
      const authed = await authenticateWithBiometrics('Enable biometric and screen lock for your journal');
      if (authed) {
        setBiometricEnabled(true);
        await AsyncStorage.setItem(BIOMETRIC_KEY, 'true');
        showStatus('App lock enabled! Your journal is now protected.');
      } else {
        showStatus('Authentication required to enable app lock.');
      }
    } else {
      // Must authenticate with Face ID / Fingerprint / PIN to turn off lock
      const authed = await authenticateWithBiometrics('Authenticate to turn off journal lock');
      if (authed) {
        setBiometricEnabled(false);
        await AsyncStorage.setItem(BIOMETRIC_KEY, 'false');
        showStatus('Journal lock turned off.');
      } else {
        // Keep it enabled if cancelled or failed
        setBiometricEnabled(true);
        showStatus('Authentication required to disable lock. Lock remains active.');
      }
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
    if (!userIsPro) {
      hapticFeedback.warning();
      setShowSubscriptionModal(true);
      return;
    }
    hapticFeedback.medium();
    showStatus('Preparing your printable Annual Journal Booklet...');
    const result = await exportJournalToPDF(state);
    if (result) {
      hapticFeedback.success();
      showStatus('Annual Keepsake PDF generated successfully!');
    }
  };

  const handleCheckUpdates = async () => {
    hapticFeedback.selection();
    setCheckingUpdate(true);
    const res = await checkForAppUpdates();
    setCheckingUpdate(false);
    if (res.isAvailable) {
      setUpdateReady(true);
      showStatus(res.message);
    } else {
      showStatus(res.message);
    }
  };

  const handleApplyUpdate = async () => {
    hapticFeedback.success();
    await reloadAppAsync();
  };

  const handleRestoreSub = async () => {
    hapticFeedback.selection();
    setRestoringSubscription(true);
    const res = await restoreUserPurchases();
    const updated = await refreshCloudUser();
    if (updated) setCloudUser(updated);
    const freshDetails = await getSubscriptionStatusDetails(updated || cloudUser);
    setSubDetails(freshDetails);
    setRestoringSubscription(false);
    showStatus(res.message);
  };

  const handleSubscriptionSuccess = async () => {
    const updated = await refreshCloudUser();
    if (updated) setCloudUser(updated);
    const freshDetails = await getSubscriptionStatusDetails(updated || cloudUser);
    setSubDetails(freshDetails);
    showStatus('FRA Journal Pro activated! Thank you.');
  };

  const handleSyncCloud = async () => {
    if (!userIsPro) {
      hapticFeedback.warning();
      setShowSubscriptionModal(true);
      return;
    }
    hapticFeedback.medium();
    setSyncLoading(true);
    const res = await syncWithCloud(state);
    setSyncLoading(false);
    if (res.success) {
      hapticFeedback.success();
      showStatus(res.message || 'Synced with cloud successfully!');
    } else {
      hapticFeedback.error();
      if (res.isProRequired) {
        setShowSubscriptionModal(true);
      }
      showStatus(res.message || 'Cloud sync failed.');
    }
  };

  const confirmLogout = () => {
    hapticFeedback.medium();
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Log Out of E-Journal?\n\nAll journal data will be cleared from this device for your privacy. Your entries remain safely backed up in the cloud and will be restored when you sign in again.'
      );
      if (confirmed) {
        handleCloudLogout();
      }
    } else {
      Alert.alert(
        'Log Out of E-Journal?',
        'All journal data will be cleared from this device for your privacy and security. Your goals remain safely backed up in your cloud account and will be restored when you sign in again.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out & Clear Device',
            style: 'destructive',
            onPress: handleCloudLogout,
          },
        ]
      );
    }
  };

  const handleCloudLogout = async () => {
    hapticFeedback.selection();
    if (onLogout) {
      await onLogout();
    } else {
      await cloudLogout();
      await resetJournalState();
      setCloudUser(null);
    }
    showStatus('Logged out and device storage cleared.');
  };

  const confirmDeleteAccount = () => {
    hapticFeedback.medium();
    const title = 'Delete Account & All Data?';
    const message =
      'This will permanently delete your user profile, all annual goals, weekly actions, daily notes, and email reminders from our servers. This action is irreversible.';

    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) {
        handleDeleteAccount();
      }
    } else {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account Forever',
          style: 'destructive',
          onPress: handleDeleteAccount,
        },
      ]);
    }
  };

  const handleDeleteAccount = async () => {
    hapticFeedback.error();
    setSyncLoading(true);
    const res = await cloudDeleteAccount();
    setSyncLoading(false);
    if (res.success) {
      if (onLogout) {
        await onLogout();
      } else {
        await resetJournalState();
        setCloudUser(null);
      }
      showStatus('Account permanently deleted.');
    } else {
      Alert.alert('Error', res.error || 'Failed to delete account.');
    }
  };

  const handleSaveReminderSettings = async () => {
    if (!userIsPro) {
      hapticFeedback.warning();
      setShowSubscriptionModal(true);
      return;
    }
    hapticFeedback.selection();
    setReminderLoading(true);
    const res = await saveReminderSettings({
      frequency: reminderFreq,
      day_of_week: reminderDay,
    });
    setReminderLoading(false);
    if (res.success) {
      showStatus('Email reminder preferences saved!');
    } else {
      showStatus(res.message || 'Failed to save reminders.');
    }
  };

  const handleSendTestReminder = async () => {
    if (!userIsPro) {
      hapticFeedback.warning();
      setShowSubscriptionModal(true);
      return;
    }
    hapticFeedback.medium();
    setReminderLoading(true);
    const res = await sendTestReminder();
    setReminderLoading(false);
    showStatus(res.message);
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
      key: 'pureLight',
      title: 'Pure Minimalist Light',
      desc: 'Clean daylight white with crisp contrast and modern indigo accents (Default).',
      icon: Sun,
    },
    {
      key: 'warmPaper',
      title: 'Warm Linen Paper',
      desc: 'The original physical journal look with dusty rose and warm taupe tones.',
      icon: Feather,
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

        {/* Text Size & Readability Card */}
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
            <ALargeSmall size={18} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              Text Size & Readability
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
            Adjust font scaling across all journal cards, planning lists, and reflections:
          </Text>

          {/* Font Size Options */}
          <View style={styles.fontSizeGrid}>
            {(Object.keys(fontSizeOptions) as (keyof typeof fontSizeOptions)[]).map((key) => {
              const opt = fontSizeOptions[key];
              const isSelected = fontSizeKey === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setFontSizeKey(key)}
                  style={[
                    styles.fontSizeOptionCard,
                    {
                      backgroundColor: isSelected ? theme.colors.primaryLight : theme.colors.cardBackground,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.cardBorder,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.fontSizeHeader}>
                    <Text
                      style={[
                        styles.fontSizeLabel,
                        {
                          color: isSelected ? theme.colors.primary : theme.colors.textDark,
                          fontWeight: isSelected ? '700' : '600',
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <View
                      style={[
                        styles.fontSizeBadge,
                        {
                          backgroundColor: isSelected ? theme.colors.primary : (theme.isDark ? '#2E2E36' : '#E2E8F0'),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.fontSizeBadgeText,
                          { color: isSelected ? '#FFFFFF' : theme.colors.textMuted },
                        ]}
                      >
                        {opt.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.fontSizeDesc, { color: theme.colors.textMuted }]}>
                    {opt.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Dynamic Live Preview Container */}
          <View
            style={[
              styles.fontPreviewContainer,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            <View style={styles.fontPreviewHeader}>
              <Text style={[styles.fontPreviewTag, { color: theme.colors.primary }]}>
                LIVE PREVIEW ({fontSizeOptions[fontSizeKey]?.badge})
              </Text>
            </View>
            <Text
              style={[
                styles.fontPreviewHeading,
                {
                  color: theme.colors.textDark,
                  fontFamily: theme.typography.fontFamilySerif,
                },
              ]}
            >
              2026 Yearly Intentions & Balance
            </Text>
            <Text style={[styles.fontPreviewBody, { color: theme.colors.textMuted }]}>
              "Small, consistent daily disciplines compound into monumental life breakthroughs."
            </Text>
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
              Biometric & Screen Lock
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
            {Platform.OS === 'web'
              ? "Device screen lock uses your phone's native Face ID, Touch ID, Fingerprint, or device lock screen PIN. This hardware security feature is active on the iOS & Android mobile apps."
              : "Keep your deeply personal thoughts, finances, and reflections private using your phone's built-in Face ID, Touch ID, Fingerprint, or device lock screen PIN (no separate PIN to create or remember)."}
          </Text>

          {Platform.OS === 'web' ? (
            <View
              style={[
                styles.webLockNotice,
                {
                  backgroundColor: theme.colors.primaryLight,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
            >
              <Info size={16} color={theme.colors.primary} />
              <Text style={[styles.webLockNoticeText, { color: theme.colors.textDark }]}>
                Available on mobile: Screen lock uses your phone's native Face ID, Touch ID, or lock screen PIN. Web browsers do not have access to OS device lock credentials.
              </Text>
            </View>
          ) : (
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.colors.textDark }]}>
                Require {biometricLabel} on Launch
              </Text>
              <Switch
                value={biometricEnabled}
                onValueChange={handleToggleBiometrics}
                trackColor={{ false: theme.colors.linedPaper, true: theme.colors.primaryLight }}
                thumbColor={biometricEnabled ? theme.colors.primary : '#FFFFFF'}
              />
            </View>
          )}
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
              Device Push Notifications (Free)
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
            Local on-device alerts scheduled directly on your phone to keep your cadence sharp. No server or email account needed.
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.switchMeta}>
              <Text style={[styles.switchLabel, { color: theme.colors.textDark }]}>Sunday Weekly Planning (7:00 PM)</Text>
              <Text style={[styles.switchSub, { color: theme.colors.textMuted }]}>Local phone alert to review prior week &amp; set Top 3 priorities</Text>
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
              <Text style={[styles.switchSub, { color: theme.colors.textMuted }]}>Local phone alert on the 28th to reflect on achievements &amp; carry forwards</Text>
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
            {!userIsPro && (
              <View style={styles.proHeaderBadge}>
                <Text style={styles.proHeaderBadgeText}>★ PRO</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Pro Membership & Subscription Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: (subDetails?.isPro || cloudUser?.is_pro) ? '#16A34A' : theme.colors.cardBorder,
              borderWidth: (subDetails?.isPro || cloudUser?.is_pro) ? 1.5 : 1,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Sparkles size={18} color={(subDetails?.isPro || cloudUser?.is_pro) ? '#16A34A' : theme.colors.primary} />
            <Text
              style={[
                styles.cardTitle,
                { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif },
              ]}
            >
              Membership & Subscription
            </Text>
          </View>

          {(subDetails?.isPro || cloudUser?.is_pro) ? (
            <View>
              <View style={[styles.proStatusBanner, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
                <Sparkles size={18} color="#15803D" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.proStatusTitle, { color: '#15803D' }]}>
                    FRA Journal Pro Active
                  </Text>
                  <Text style={[styles.proStatusSub, { color: '#166534' }]}>
                    Billed via {subDetails?.platformName || (cloudUser?.subscription?.platform === 'apple_iap' ? 'Apple App Store' : cloudUser?.subscription?.platform === 'google_play' ? 'Google Play' : 'App Store')}
                  </Text>
                  {subDetails?.expirationFormatted ? (
                    <View style={styles.expiryRow}>
                      <Clock size={12} color="#166534" style={{ marginRight: 4 }} />
                      <Text style={[styles.expiryText, { color: '#166534' }]}>
                        {subDetails.willRenew ? 'Next Renewal: ' : 'Expires: '}
                        <Text style={{ fontWeight: '700' }}>{subDetails.expirationFormatted}</Text>
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <Pressable
                onPress={handleRestoreSub}
                disabled={restoringSubscription}
                style={[styles.buttonSecondary, { borderColor: theme.colors.cardBorder, marginTop: 10 }]}
              >
                {restoringSubscription ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <RotateCcw size={14} color={theme.colors.primary} />
                )}
                <Text style={[styles.buttonSecondaryText, { color: theme.colors.primary }]}>
                  {restoringSubscription ? 'Checking stores...' : 'Sync & Restore Purchases'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
                You are currently on the Free Starter plan. Upgrade to FRA Journal Pro to unlock unlimited AI goal decomposition, real-time multi-device cloud sync, printable annual keepsakes, and automated email reminders.
              </Text>

              <View style={styles.upgradeActionsCol}>
                <Pressable
                  onPress={() => {
                    hapticFeedback.selection();
                    setShowSubscriptionModal(true);
                  }}
                  style={[styles.upgradeProBtn, { backgroundColor: theme.colors.primary }]}
                >
                  <Sparkles size={16} color="#FFFFFF" />
                  <Text style={styles.upgradeProBtnText}>Upgrade to FRA Journal Pro ($6.99/yr)</Text>
                </Pressable>

                <Pressable
                  onPress={handleRestoreSub}
                  disabled={restoringSubscription}
                  style={[styles.restoreSubBtn, { borderColor: theme.colors.cardBorder }]}
                >
                  {restoringSubscription ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <RotateCcw size={14} color={theme.colors.textDark} />
                  )}
                  <Text style={[styles.restoreSubBtnText, { color: theme.colors.textDark }]}>
                    {restoringSubscription ? 'Checking stores...' : 'Restore Purchases'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* User Account Profile Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.profileHeaderRow}>
            <View style={[styles.profileAvatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.profileAvatarText}>
                {cloudUser?.full_name
                  ? cloudUser.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : 'ME'}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text
                style={[
                  styles.profileName,
                  { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif },
                ]}
              >
                {cloudUser?.full_name || 'E-Journal Member'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.colors.textMuted }]}>
                {cloudUser?.email || ''}
              </Text>
              <View style={[styles.memberBadge, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={[styles.memberBadgeText, { color: theme.colors.primary }]}>
                  ★ {cloudUser?.membership_tag || (cloudUser?.is_kws_member ? 'Kingdom Wealth Summit Member' : 'E-Journal Member')}
                </Text>
              </View>
            </View>
          </View>

          {/* Sync Status Banner */}
          <View
            style={[
              styles.syncStatusBox,
              { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.cardBorder },
            ]}
          >
            <ShieldCheck size={16} color={theme.colors.primary} />
            <Text style={[styles.syncStatusText, { color: theme.colors.textDark }]}>
              Journal connected &amp; automatically backed up to cloud.
            </Text>
          </View>

          {/* Actions: Sync Now & Logout */}
          <View style={styles.profileActionsRow}>
            <Pressable
              onPress={handleSyncCloud}
              disabled={syncLoading}
              style={[
                styles.syncNowBtn,
                { backgroundColor: theme.colors.linedPaper, borderColor: theme.colors.cardBorder },
              ]}
            >
              {syncLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <RefreshCw size={14} color={theme.colors.primary} />
              )}
              <Text style={[styles.syncNowBtnText, { color: theme.colors.textDark }]}>
                Sync Changes to Cloud Now
              </Text>
              {!userIsPro && (
                <View style={styles.proHeaderBadge}>
                  <Text style={styles.proHeaderBadgeText}>★ PRO</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={confirmLogout}
              style={[
                styles.logoutBtn,
                { backgroundColor: theme.colors.primaryLight, borderColor: '#EF4444' },
              ]}
            >
              <LogOut size={15} color="#EF4444" />
              <Text style={styles.logoutBtnText}>Log Out &amp; Clear Device Data</Text>
            </Pressable>

            <Pressable
              onPress={confirmDeleteAccount}
              style={[
                styles.deleteAccountBtn,
                { backgroundColor: theme.isDark ? '#2E1518' : '#FEF2F2', borderColor: '#FCA5A5' },
              ]}
            >
              <Trash2 size={15} color="#DC2626" />
              <Text style={styles.deleteAccountBtnText}>Delete Account &amp; Wipe Cloud Data</Text>
            </Pressable>

            <Pressable
              onPress={() => Linking.openURL('https://kws2026.vercel.app/delete-account')}
              style={styles.webDeleteLinkBtn}
            >
              <ExternalLink size={12} color={theme.colors.textMuted} />
              <Text style={[styles.webDeleteLinkText, { color: theme.colors.textMuted }]}>
                Request deletion via web portal (delete-account)
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Email Goal Reminders Card */}
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
            <Mail size={18} color="#D97706" />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              Email Goal Reminders
            </Text>
            {!userIsPro && (
              <View style={styles.proHeaderBadge}>
                <Text style={styles.proHeaderBadgeText}>★ PRO</Text>
              </View>
            )}
          </View>
          <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
            Receive periodic email check-ins delivered to your inbox with your Top 3 yearly goals, weekly habit focus, and personal reflection link.
          </Text>

          {!userIsPro && (
            <View style={[styles.proNoticeBanner, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
              <Sparkles size={15} color="#D97706" />
              <Text style={[styles.proNoticeText, { color: '#92400E' }]}>
                Automated email delivery requires FRA Journal Pro. On-device push notifications above remain 100% free.
              </Text>
            </View>
          )}

          {/* Frequency Chips */}
          <Text style={[styles.switchSub, { color: theme.colors.textMuted, marginBottom: 6 }]}>
            Delivery Frequency:
          </Text>
          <View style={styles.chipRow}>
            {[
              { id: 'weekly', label: 'Weekly' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'daily', label: 'Daily' },
              { id: 'disabled', label: 'Off' },
            ].map((f) => {
              const effectiveFreq = userIsPro ? reminderFreq : 'disabled';
              const isAct = effectiveFreq === f.id;
              return (
                <Pressable
                  key={f.id}
                  onPress={() => {
                    if (!userIsPro) {
                      hapticFeedback.warning();
                      setShowSubscriptionModal(true);
                      return;
                    }
                    setReminderFreq(f.id as any);
                  }}
                  style={[
                    styles.chipBtn,
                    {
                      backgroundColor: isAct ? theme.colors.primary : theme.colors.primaryLight,
                      borderColor: isAct ? theme.colors.primary : theme.colors.cardBorder,
                      opacity: !userIsPro && f.id !== 'disabled' ? 0.6 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.chipBtnText, { color: isAct ? '#FFFFFF' : theme.colors.textDark }]}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {!userIsPro ? (
            <Pressable
              onPress={() => {
                hapticFeedback.selection();
                setShowSubscriptionModal(true);
              }}
              style={[styles.buttonPrimary, { backgroundColor: '#D97706', width: '100%' }]}
            >
              <Sparkles size={15} color="#FFFFFF" />
              <Text style={styles.buttonPrimaryText}>Unlock Email Reminders with Pro</Text>
            </Pressable>
          ) : (
            <View style={styles.buttonRow}>
              <Pressable
                onPress={handleSaveReminderSettings}
                disabled={reminderLoading}
                style={[styles.buttonSecondary, { borderColor: theme.colors.cardBorder, flex: 1 }]}
              >
                <Check size={14} color={theme.colors.textDark} />
                <Text style={[styles.buttonSecondaryText, { color: theme.colors.textDark }]}>
                  Save Preferences
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSendTestReminder}
                disabled={reminderLoading || !cloudUser}
                style={[
                  styles.buttonPrimary,
                  { backgroundColor: '#D97706', flex: 1, opacity: !cloudUser ? 0.6 : 1 },
                ]}
              >
                {reminderLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Mail size={14} color="#FFFFFF" />
                )}
                <Text style={styles.buttonPrimaryText}>Send Test Email</Text>
              </Pressable>
            </View>
          )}
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

        {/* App Version & Updates */}
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
            <CloudDownload size={18} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif }]}>
              App Version & Updates
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
            Ensure your journal is running the latest version with new templates, performance enhancements, and bug fixes.
          </Text>

          {/* Version Info Row */}
          <View style={[styles.updateVersionRow, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.cardBorder }]}>
            <Text style={[styles.updateVersionLabel, { color: theme.colors.textDark }]}>App Version</Text>
            <Text style={[styles.updateVersionVal, { color: theme.colors.primary }]}>v{getAppVersion()}</Text>
          </View>

          {updateReady ? (
            <Pressable
              onPress={handleApplyUpdate}
              style={[styles.buttonPrimary, { backgroundColor: '#16A34A', marginTop: 12 }]}
            >
              <RefreshCw size={15} color="#FFFFFF" />
              <Text style={styles.buttonPrimaryText}>Restart App to Apply Update</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleCheckUpdates}
              disabled={checkingUpdate}
              style={[styles.buttonSecondary, { borderColor: theme.colors.cardBorder, marginTop: 12 }]}
            >
              {checkingUpdate ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <RefreshCw size={14} color={theme.colors.primary} />
              )}
              <Text style={[styles.buttonSecondaryText, { color: theme.colors.primary }]}>
                {checkingUpdate ? 'Checking for updates...' : 'Check for Updates'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Reset Journal */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: '#FCA5A5',
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <RotateCcw size={18} color="#DC2626" />
            <Text style={[styles.cardTitle, { color: '#DC2626', fontFamily: theme.typography.fontFamilySerif }]}>
              Reset Journal
            </Text>
          </View>

          {/* Warning Banner */}
          <View style={[styles.resetWarningBox, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
            <AlertTriangle size={16} color="#DC2626" />
            <Text style={[styles.resetWarningText, { color: '#991B1B' }]}>
              Warning: Resetting permanently deletes all your annual goals, quarterly milestones, habit trackers, and notes across all years. This action is irreversible.
            </Text>
          </View>

          <Text style={[styles.cardDesc, { color: theme.colors.textMuted, marginTop: 4 }]}>
            If you wish to start over with a fresh blank journal, make sure to export a PDF or save a JSON backup copy from the Backup section above first.
          </Text>

          <Pressable
            onPress={() => {
              hapticFeedback.warning();
              setShowResetConfirmModal(true);
            }}
            style={[styles.dangerButton, { backgroundColor: '#DC2626' }]}
          >
            <RotateCcw size={14} color="#FFFFFF" />
            <Text style={styles.dangerButtonText}>Reset Journal to Clean Starter...</Text>
          </Pressable>
        </View>

        {/* Legal & Data Privacy */}
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
              Legal &amp; Data Privacy
            </Text>
          </View>
          <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
            Review our privacy commitments, store licensing terms, or request account and data deletion.
          </Text>

          <View style={styles.legalLinksContainer}>
            <Pressable
              onPress={() => Linking.openURL('https://kws2026.vercel.app/privacy')}
              style={[styles.legalLinkRow, { borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.primaryLight }]}
            >
              <Text style={[styles.legalLinkLabel, { color: theme.colors.textDark }]}>Privacy Policy</Text>
              <ExternalLink size={14} color={theme.colors.primary} />
            </Pressable>

            <Pressable
              onPress={() => Linking.openURL('https://kws2026.vercel.app/terms')}
              style={[styles.legalLinkRow, { borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.primaryLight }]}
            >
              <Text style={[styles.legalLinkLabel, { color: theme.colors.textDark }]}>Terms of Use (EULA)</Text>
              <ExternalLink size={14} color={theme.colors.primary} />
            </Pressable>

            <Pressable
              onPress={() => Linking.openURL('https://kws2026.vercel.app/delete-account')}
              style={[styles.legalLinkRow, { borderColor: '#FCA5A5', backgroundColor: theme.isDark ? '#2E1518' : '#FEF2F2' }]}
            >
              <Text style={[styles.legalLinkLabel, { color: '#DC2626' }]}>Request Account &amp; Data Deletion</Text>
              <ExternalLink size={14} color="#DC2626" />
            </Pressable>
          </View>
        </View>
      </View>

      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => {
          setShowSubscriptionModal(false);
          getSubscriptionStatusDetails(cloudUser).then(setSubDetails);
        }}
        onSuccess={handleSubscriptionSuccess}
      />

      {/* Reset Confirmation Modal */}
      <Modal
        visible={showResetConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.resetModalCard,
              {
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            <View style={styles.resetModalIconCircle}>
              <AlertTriangle size={28} color="#DC2626" />
            </View>

            <Text
              style={[
                styles.resetModalTitle,
                {
                  color: theme.colors.textDark,
                  fontFamily: theme.typography.fontFamilySerif,
                },
              ]}
            >
              Reset Entire Journal?
            </Text>

            <Text style={[styles.resetModalSubtitle, { color: theme.colors.textMuted }]}>
              Are you sure you want to permanently reset your journal?
            </Text>

            <View style={styles.resetImplicationsList}>
              <View style={styles.resetImplicationItem}>
                <Text style={styles.resetBullet}>•</Text>
                <Text style={[styles.resetImplicationText, { color: theme.colors.textDark }]}>
                  All annual goals & focus areas across all years will be wiped.
                </Text>
              </View>
              <View style={styles.resetImplicationItem}>
                <Text style={styles.resetBullet}>•</Text>
                <Text style={[styles.resetImplicationText, { color: theme.colors.textDark }]}>
                  All weekly habits, cadence notes, and reflections will be cleared.
                </Text>
              </View>
              <View style={styles.resetImplicationItem}>
                <Text style={styles.resetBullet}>•</Text>
                <Text style={[styles.resetImplicationText, { color: '#DC2626', fontWeight: '700' }]}>
                  This action is permanent and cannot be undone.
                </Text>
              </View>
            </View>

            <Text style={[styles.resetBackupAdvice, { color: theme.colors.textMuted }]}>
              Tip: Cancel to export your current journal as a PDF or JSON backup first before resetting.
            </Text>

            <View style={styles.resetModalActionRow}>
              <Pressable
                onPress={() => {
                  hapticFeedback.selection();
                  setShowResetConfirmModal(false);
                }}
                style={[
                  styles.resetCancelBtn,
                  {
                    backgroundColor: theme.colors.primaryLight || '#F3F4F6',
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
              >
                <Text style={[styles.resetCancelBtnText, { color: theme.colors.textDark }]}>
                  Keep My Journal (Cancel)
                </Text>
              </Pressable>

              <Pressable
                onPress={async () => {
                  setShowResetConfirmModal(false);
                  await handleReset();
                }}
                style={[
                  styles.resetConfirmBtn,
                  { backgroundColor: '#DC2626' },
                ]}
              >
                <RotateCcw size={15} color="#FFFFFF" />
                <Text style={styles.resetConfirmBtnText}>Yes, Reset Everything</Text>
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
  fontSizeGrid: {
    gap: 10,
  },
  fontSizeOptionCard: {
    borderRadius: 10,
    padding: 12,
  },
  fontSizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fontSizeLabel: {
    fontSize: 14,
  },
  fontSizeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fontSizeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fontSizeDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  fontPreviewContainer: {
    marginTop: 14,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  fontPreviewHeader: {
    marginBottom: 6,
  },
  fontPreviewTag: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fontPreviewHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  fontPreviewBody: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 19,
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
  webLockNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    marginTop: 8,
  },
  webLockNoticeText: {
    fontSize: 12.5,
    flex: 1,
    lineHeight: 18,
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
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  buttonSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  upgradeActionsCol: {
    gap: 10,
    marginTop: 6,
    marginBottom: 4,
  },
  upgradeProBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  upgradeProBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  restoreSubBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  restoreSubBtnText: {
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
  keyInputSmall: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chipBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  authCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  authModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  authTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInputFull: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12.5,
    marginBottom: 6,
  },
  memberBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  memberBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  syncStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  syncStatusText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  profileActionsRow: {
    flexDirection: 'column',
    gap: 10,
  },
  syncNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  syncNowBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  deleteAccountBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  updateVersionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  updateVersionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  updateVersionVal: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  proStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  proStatusTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  proStatusSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  expiryText: {
    fontSize: 12,
    lineHeight: 16,
  },
  webDeleteLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
    paddingVertical: 4,
  },
  webDeleteLinkText: {
    fontSize: 11.5,
    textDecorationLine: 'underline',
  },
  legalLinksContainer: {
    gap: 8,
    marginTop: 6,
  },
  legalLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  legalLinkLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  proNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  proNoticeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    flex: 1,
  },
  proHeaderBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  proHeaderBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resetWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  resetWarningText: {
    fontSize: 12.5,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  resetModalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  resetModalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  resetModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  resetModalSubtitle: {
    fontSize: 13.5,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 19,
  },
  resetImplicationsList: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  resetImplicationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  resetBullet: {
    color: '#DC2626',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },
  resetImplicationText: {
    fontSize: 12.5,
    lineHeight: 17,
    flex: 1,
  },
  resetBackupAdvice: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    fontStyle: 'italic',
    marginBottom: 18,
  },
  resetModalActionRow: {
    flexDirection: 'column',
    width: '100%',
    gap: 10,
  },
  resetCancelBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resetConfirmBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resetConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
