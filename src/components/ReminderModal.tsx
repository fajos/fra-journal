import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
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
  const { theme } = useTheme();
  const [selectedOption, setSelectedOption] = useState<'1week' | 'endQuarter' | 'sunday' | 'monthEnd'>('1week');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSchedule = async () => {
    hapticFeedback.medium();
    const now = new Date();

    if (selectedOption === '1week') {
      const target = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      await scheduleMilestoneReminder(milestoneTitle, goalArea, target);
      setStatusMessage('Reminder scheduled for 1 week from now!');
    } else if (selectedOption === 'endQuarter') {
      const target = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
      await scheduleMilestoneReminder(milestoneTitle, goalArea, target);
      setStatusMessage('Reminder scheduled for Quarter Check-in!');
    } else if (selectedOption === 'sunday') {
      await scheduleWeeklyPlanningCadence(19, 0);
      setStatusMessage('Sunday 7:00 PM weekly planning reminder activated!');
    } else if (selectedOption === 'monthEnd') {
      await scheduleMonthlyReviewCadence(18, 0);
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
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Bell size={18} color={theme.colors.primary} />
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.colors.textDark,
                    fontFamily: theme.typography.fontFamilySerif,
                  },
                ]}
              >
                Set Milestone Reminder
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={18} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <View
            style={[
              styles.contextBox,
              {
                backgroundColor: theme.colors.primaryLight,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.contextArea, { color: theme.colors.primary }]}>{goalArea}</Text>
            <Text style={[styles.contextTitle, { color: theme.colors.textDark }]} numberOfLines={2}>
              "{milestoneTitle}"
            </Text>
          </View>

          {statusMessage ? (
            <View style={styles.successBox}>
              <Check size={16} color={theme.colors.success} />
              <Text style={[styles.successText, { color: theme.colors.success }]}>{statusMessage}</Text>
            </View>
          ) : (
            <View style={styles.optionsList}>
              {([
                { key: '1week' as const, title: 'In 1 Week', desc: 'Quick progress check on this milestone', icon: Clock },
                { key: 'endQuarter' as const, title: 'Quarter Check-In', desc: 'Milestone deadline review', icon: Calendar },
                { key: 'sunday' as const, title: 'Recurring Sunday 7 PM', desc: 'Weekly planning & priority setting prompt', icon: Bell },
                { key: 'monthEnd' as const, title: 'Month-End Reflection', desc: 'Monthly review & carry-forward reminder', icon: Bell },
              ]).map(({ key, title, desc, icon: IconComponent }) => {
                const isAct = selectedOption === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setSelectedOption(key)}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: isAct ? theme.colors.primaryLight : theme.colors.cardBackground,
                        borderColor: isAct ? theme.colors.primary : theme.colors.cardBorder,
                      },
                    ]}
                  >
                    <IconComponent size={16} color={isAct ? theme.colors.primary : theme.colors.textMuted} />
                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.optionTitle,
                          { color: isAct ? theme.colors.primary : theme.colors.textDark },
                        ]}
                      >
                        {title}
                      </Text>
                      <Text style={[styles.optionDesc, { color: theme.colors.textMuted }]}>{desc}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={styles.buttonRow}>
            <Pressable
              onPress={onClose}
              style={[styles.cancelBtn, { borderColor: theme.colors.cardBorder }]}
            >
              <Text style={[styles.cancelBtnText, { color: theme.colors.textDark }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSchedule}
              style={[styles.confirmBtn, { backgroundColor: theme.colors.primary }]}
            >
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
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
    fontWeight: '700',
  },
  contextBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  contextArea: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  contextTitle: {
    fontSize: 13,
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
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: 11,
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
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
