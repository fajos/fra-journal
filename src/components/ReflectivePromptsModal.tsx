import React from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { Text } from './AppText';
import { useTheme } from '../context/ThemeContext';
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
  const { theme } = useTheme();
  const prompts = PROMPTS_BY_TYPE[contextType] || PROMPTS_BY_TYPE.whyItMatters;

  const handleSelect = (text: string) => {
    hapticFeedback.light();
    onSelectPrompt(text);
    onClose();
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
              <Sparkles size={18} color={theme.colors.primary} />
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.colors.textDark,
                    fontFamily: theme.typography.fontFamilySerif,
                  },
                ]}
              >
                Reflective Coaching Prompts
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={18} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Tap any prompt to inspire your reflection or append it directly:
          </Text>

          <ScrollView style={styles.promptsList}>
            {prompts.map((p, idx) => (
              <Pressable
                key={idx}
                onPress={() => handleSelect(p)}
                style={[
                  styles.promptItem,
                  {
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
              >
                <Text style={[styles.promptText, { color: theme.colors.textDark }]}>"{p}"</Text>
                <ChevronRight size={14} color={theme.colors.primary} />
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: theme.colors.primaryLight }]}
          >
            <Text style={[styles.closeBtnText, { color: theme.colors.primary }]}>Done</Text>
          </Pressable>
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
    maxWidth: 440,
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    maxHeight: '80%',
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
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12.5,
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  promptText: {
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
    paddingRight: 8,
  },
  closeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
