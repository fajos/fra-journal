import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { THEME } from '../constants/theme';
import {
  scheduleMilestoneReminder,
  scheduleWeeklyPlanningCadence,
  scheduleMonthlyReviewCadence,
} from '../services/notificationService';
import { hapticFeedback } from '../services/hapticsService';
import { Bell, Calendar, Check, X, Clock } from 'lucide-react-native';

interface ReminderModalProps {
  visible: boolean;
  onClose: () => void;
  milestoneTitle?: string;
  goalArea?: string;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  visible,
  onClose,
  milestoneTitle = 'Quarterly Milestone',
  goalArea = 'Personal growth',
}) => {
  const [selectedOption, setSelectedOption] = useState<'1week' | 'endQuarter' | 'sunday' | 'monthEnd'>('1week');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSchedule = async () => {
    hapticFeedback.medium();
    let scheduledId: string | null = null;
    const now = new Date();

    if (selectedOption === '1week') {
      const target = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      scheduledId = await scheduleMilestoneReminder(milestoneTitle, goalArea, target);
      setStatusMessage('Reminder scheduled for 1 week from now!');
    } else if (selectedOption === 'endQuarter') {
      const target = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
      scheduledId = await scheduleMilestoneReminder(milestoneTitle, goalArea, target);
      setStatusMessage('Reminder scheduled for Quarter Check-in!');
    } else if (selectedOption === 'sunday') {
      scheduledId = await scheduleWeeklyPlanningCadence(19, 0);
      setStatusMessage('Sunday 7:00 PM weekly planning reminder activated!');
    } else if (selectedOption === 'monthEnd') {
      scheduledId = await scheduleMonthlyReviewCadence(18, 0);
      setStatusMessage('Month-end review reminder activated!');
    }

    hapticFeedback.success();
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1500);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Bell size={18} color={THEME.colors.primary} />
              <Text style={styles.title}>Set Milestone Reminder</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={18} color={THEME.colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.contextBox}>
            <Text style={styles.contextArea}>{goalArea}</Text>
            <Text style={styles.contextTitle} numberOfLines={2}>
              "{milestoneTitle}"
            </Text>
          </View>

          {statusMessage ? (
            <View style={styles.successBox}>
              <Check size={16} color={THEME.colors.success} />
              <Text style={styles.successText}>{statusMessage}</Text>
            </View>
          ) : (
            <View style={styles.optionsList}>
              <Pressable
                onPress={() => setSelectedOption('1week')}
                style={[styles.optionRow, selectedOption === '1week' && styles.optionRowActive]}
              >
                <Clock size={16} color={selectedOption === '1week' ? THEME.colors.primary : THEME.colors.textMuted} />
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, selectedOption === '1week' && styles.optionTitleActive]}>
                    In 1 Week
                  </Text>
                  <Text style={styles.optionDesc}>Quick progress check on this milestone</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setSelectedOption('endQuarter')}
                style={[styles.optionRow, selectedOption === 'endQuarter' && styles.optionRowActive]}
              >
                <Calendar size={16} color={selectedOption === 'endQuarter' ? THEME.colors.primary : THEME.colors.textMuted} />
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, selectedOption === 'endQuarter' && styles.optionTitleActive]}>
                    Quarter Check-In
                  </Text>
                  <Text style={styles.optionDesc}>Milestone deadline review</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setSelectedOption('sunday')}
                style={[styles.optionRow, selectedOption === 'sunday' && styles.optionRowActive]}
              >
                <Bell size={16} color={selectedOption === 'sunday' ? THEME.colors.primary : THEME.colors.textMuted} />
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, selectedOption === 'sunday' && styles.optionTitleActive]}>
                    Recurring Sunday 7 PM
                  </Text>
                  <Text style={styles.optionDesc}>Weekly planning & priority setting prompt</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setSelectedOption('monthEnd')}
                style={[styles.optionRow, selectedOption === 'monthEnd' && styles.optionRowActive]}
              >
                <Bell size={16} color={selectedOption === 'monthEnd' ? THEME.colors.primary : THEME.colors.textMuted} />
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, selectedOption === 'monthEnd' && styles.optionTitleActive]}>
                    Month-End Reflection
                  </Text>
                  <Text style={styles.optionDesc}>Monthly review & carry-forward reminder</Text>
                </View>
              </Pressable>
            </View>
          )}

          <View style={styles.buttonRow}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSchedule} style={styles.confirmBtn}>
              <Bell size={14} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>Schedule Reminder</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(40, 32, 28, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: 20,
    ...THEME.shadow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: THEME.typography.fontFamilySerif,
    fontWeight: '700',
    color: THEME.colors.textDark,
  },
  contextBox: {
    backgroundColor: '#FCFAF7',
    borderWidth: 1,
    borderColor: THEME.colors.linedPaper,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  contextArea: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginBottom: 2,
  },
  contextTitle: {
    fontSize: 13,
    color: THEME.colors.textDark,
    fontStyle: 'italic',
  },
  optionsList: {
    gap: 8,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    backgroundColor: '#FFFFFF',
  },
  optionRowActive: {
    backgroundColor: THEME.colors.primaryLight,
    borderColor: THEME.colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textDark,
  },
  optionTitleActive: {
    color: THEME.colors.primary,
  },
  optionDesc: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EDF6EF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6CE',
    marginBottom: 16,
  },
  successText: {
    fontSize: 13,
    color: THEME.colors.success,
    fontWeight: '600',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textDark,
  },
  confirmBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
