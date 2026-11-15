import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { JournalState } from '../types/journal';
import { THEME } from '../constants/theme';
import { FloralHeader } from '../components/FloralHeader';
import { resetJournalState } from '../storage/journalStorage';
import {
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  Calendar,
  Printer,
  Check,
  Copy,
} from 'lucide-react-native';

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

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleExport = () => {
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
    const fresh = await resetJournalState();
    onUpdateState(fresh);
    showStatus('Reset to fresh sample journal.');
  };

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    } else {
      showStatus('Printing is best experienced when viewing on the web browser!');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FloralHeader
        title="Journal Settings & Backup"
        subtitle="Manage your offline journal data, backups, and journal year"
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

        {/* Year Setting */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={17} color={THEME.colors.primary} />
            <Text style={styles.cardTitle}>Journal Year</Text>
          </View>
          <View style={styles.yearRow}>
            {([2025, 2026, 2027, 2028] as const).map((yr) => (
              <Pressable
                key={yr}
                onPress={() => onUpdateState({ ...state, year: yr })}
                style={[styles.yearChip, state.year === yr && styles.yearChipActive]}
              >
                <Text style={[styles.yearChipText, state.year === yr && styles.yearChipTextActive]}>
                  {yr}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Print / Export */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Printer size={17} color={THEME.colors.secondary} />
            <Text style={styles.cardTitle}>Print & Paper Layout</Text>
          </View>
          <Text style={styles.cardDesc}>
            Print or save your digital journal pages as physical-matching PDF sheets.
          </Text>
          <Pressable onPress={handlePrint} style={styles.buttonSecondary}>
            <Printer size={15} color={THEME.colors.textDark} />
            <Text style={styles.buttonSecondaryText}>Print / Save as PDF</Text>
          </Pressable>
        </View>

        {/* Data Backup & Restore */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Download size={17} color={THEME.colors.primary} />
            <Text style={styles.cardTitle}>Backup & Restore (JSON)</Text>
          </View>
          <Text style={styles.cardDesc}>
            Your journal data is stored 100% offline and private on your device. Export a backup or restore onto another device anytime.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable onPress={handleExport} style={styles.buttonPrimary}>
              <Download size={15} color="#FFFFFF" />
              <Text style={styles.buttonPrimaryText}>Export Backup</Text>
            </Pressable>
            <Pressable onPress={handleImport} style={styles.buttonSecondary}>
              <Upload size={15} color={THEME.colors.textDark} />
              <Text style={styles.buttonSecondaryText}>Restore from JSON</Text>
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
            <RotateCcw size={17} color={THEME.colors.danger} />
            <Text style={styles.cardTitle}>Reset Journal</Text>
          </View>
          <Text style={styles.cardDesc}>
            Reset all entries back to the clean default starter template.
          </Text>
          <Pressable onPress={handleReset} style={styles.dangerButton}>
            <RotateCcw size={14} color="#FFFFFF" />
            <Text style={styles.dangerButtonText}>Reset to Default Starters</Text>
          </Pressable>
        </View>

        {/* Framework Guide */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <BookOpen size={17} color={THEME.colors.primary} />
            <Text style={styles.cardTitle}>Journaling Cascade System</Text>
          </View>
          <Text style={styles.guideStep}>
            <Text style={styles.bold}>1. Year Goals:</Text> Define goals across 8 holistic life areas and select your Top 3.
          </Text>
          <Text style={styles.guideStep}>
            <Text style={styles.bold}>2. Goal Breakdown:</Text> Clarify why it matters, outline Q1-Q4 milestones, and list needed support.
          </Text>
          <Text style={styles.guideStep}>
            <Text style={styles.bold}>3. Quarter Plan:</Text> Establish each quarter's theme and 3 monthly checkpoint targets.
          </Text>
          <Text style={styles.guideStep}>
            <Text style={styles.bold}>4. Month Plan:</Text> 5 key goals, 6 daily to-dos, and reflection notes.
          </Text>
          <Text style={styles.guideStep}>
            <Text style={styles.bold}>5. Weekly Planner:</Text> Top 3 priorities, Mon-Sun agenda, and carry forward notes.
          </Text>
          <Text style={styles.guideStep}>
            <Text style={styles.bold}>6. Month in Review:</Text> Celebrate wins, analyze undone tasks, note what got in the way, and carry forward.
          </Text>
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
  },
  yearChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: THEME.radius.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  buttonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    borderRadius: THEME.radius.sm,
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
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
  guideStep: {
    fontSize: 13,
    lineHeight: 20,
    color: THEME.colors.textDark,
    marginBottom: 6,
  },
  bold: {
    fontWeight: '700',
    color: THEME.colors.primary,
  },
});
