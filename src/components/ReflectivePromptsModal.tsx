import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { THEME } from '../constants/theme';
import { Sparkles, X, ChevronRight } from 'lucide-react-native';
import { hapticFeedback } from '../services/hapticsService';

interface ReflectivePromptsModalProps {
  visible: boolean;
  onClose: () => void;
  contextType: 'whyItMatters' | 'quarterTheme' | 'monthReview' | 'supportNeeded';
  onSelectPrompt: (promptText: string) => void;
}

const PROMPTS_BY_TYPE = {
  whyItMatters: [
    'How will achieving this goal transform the way I feel every morning?',
    'Who in my life benefits most when I show up at my best in this area?',
    'If I don’t pursue this goal this year, what will it cost me in 5 years?',
    'What core personal value (freedom, health, love, mastery) does this fulfill?',
  ],
  quarterTheme: [
    'Foundation & Systems: Building unbreakable daily habits.',
    'Expansion & Momentum: Stepping outside my comfort zone with boldness.',
    'Depth & Mastery: Eliminating distractions to focus on deep excellence.',
    'Harvest & Gratitude: Bringing initiatives to completion with celebration.',
  ],
  monthReview: [
    'What was the most courageous or disciplined decision I made this month?',
    'Where did I experience friction, and was it internal resistance or external circumstance?',
    'What small win brought me unexpected joy or peace?',
    'What is one boundary I need to establish or protect next month?',
  ],
  supportNeeded: [
    'An accountability partner who will check in on me every other Sunday.',
    'A dedicated physical sanctuary or time block guarded from notifications.',
    'A mentor, book, or course that has already solved the exact problem I face.',
    'Self-compassion: Giving myself permission to restart whenever I falter.',
  ],
};

export const ReflectivePromptsModal: React.FC<ReflectivePromptsModalProps> = ({
  visible,
  onClose,
  contextType,
  onSelectPrompt,
}) => {
  const prompts = PROMPTS_BY_TYPE[contextType] || PROMPTS_BY_TYPE.whyItMatters;

  const handleSelect = (text: string) => {
    hapticFeedback.light();
    onSelectPrompt(text);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Sparkles size={18} color={THEME.colors.primary} />
              <Text style={styles.title}>Reflective Coaching Prompts</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={18} color={THEME.colors.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Tap any prompt to inspire your reflection or append it directly:
          </Text>

          <ScrollView style={styles.promptsList}>
            {prompts.map((p, idx) => (
              <Pressable
                key={idx}
                onPress={() => handleSelect(p)}
                style={styles.promptItem}
              >
                <Text style={styles.promptText}>"{p}"</Text>
                <ChevronRight size={14} color={THEME.colors.primary} />
              </Pressable>
            ))}
          </ScrollView>

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Done</Text>
          </Pressable>
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
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: 20,
    maxHeight: '80%',
    ...THEME.shadow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  subtitle: {
    fontSize: 12.5,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  promptsList: {
    gap: 8,
    marginBottom: 14,
  },
  promptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FCFAF7',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.linedPaper,
    marginBottom: 8,
  },
  promptText: {
    fontSize: 13,
    color: THEME.colors.textDark,
    lineHeight: 19,
    flex: 1,
    paddingRight: 8,
  },
  closeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: THEME.colors.primaryLight,
    borderRadius: 8,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
});
