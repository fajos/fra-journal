import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Sparkles, X, Check, Brain, Key, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { LifeArea } from '../types/journal';
import {
  DecomposedPlan,
  decomposeGoal,
} from '../services/aiDecomposeService';
import { hapticFeedback } from '../services/hapticsService';

interface AiDecomposeModalProps {
  visible: boolean;
  onClose: () => void;
  area: LifeArea;
  initialGoalText: string;
  year: number;
  onApply: (plan: DecomposedPlan) => void;
}

export const AiDecomposeModal: React.FC<AiDecomposeModalProps> = ({
  visible,
  onClose,
  area,
  initialGoalText,
  year,
  onApply,
}) => {
  const { theme } = useTheme();
  const [goalText, setGoalText] = useState(initialGoalText);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<DecomposedPlan | null>(null);

  useEffect(() => {
    setGoalText(initialGoalText);
    setPlan(null);
  }, [visible, initialGoalText]);

  const handleRun = async () => {
    if (!goalText.trim()) return;
    hapticFeedback.medium();
    setLoading(true);
    setPlan(null);

    try {
      const res = await decomposeGoal(area, goalText, year);
      setPlan(res);
      hapticFeedback.success();
    } catch {
      hapticFeedback.error();
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!plan) return;
    hapticFeedback.success();
    onApply(plan);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Sparkles size={18} color="#D97706" />
              <Text
                style={[
                  styles.title,
                  { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif },
                ]}
              >
                Intelligent Goal Decomposition
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={18} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Area Badge */}
            <View style={styles.metaRow}>
              <View style={[styles.areaBadge, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={[styles.areaBadgeText, { color: theme.colors.primary }]}>{area}</Text>
              </View>
              <Text style={[styles.yearText, { color: theme.colors.textMuted }]}>Target: {year}</Text>
            </View>

            {/* Goal Input */}
            <Text style={[styles.label, { color: theme.colors.textDark }]}>Yearly Goal Statement</Text>
            <TextInput
              value={goalText}
              onChangeText={setGoalText}
              placeholder="Enter your goal (e.g. Run a half marathon under 2 hours)..."
              placeholderTextColor={theme.colors.textLight}
              multiline
              numberOfLines={2}
              style={[
                styles.goalInput,
                {
                  color: theme.colors.textDark,
                  backgroundColor: theme.colors.primaryLight,
                  borderColor: theme.colors.cardBorder,
                },
              ]}
            />

            {/* AI Engine Status Badge */}
            <View
              style={[
                styles.engineBadgeBox,
                { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.cardBorder },
              ]}
            >
              <Brain size={15} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.engineBadgeTitle, { color: theme.colors.textDark }]}>
                  Intelligent Cascading Decomposition
                </Text>
                <Text style={[styles.engineBadgeSub, { color: theme.colors.textMuted }]}>
                  AI engine powered by background server environment
                </Text>
              </View>
            </View>

            {/* Trigger Button */}
            <Pressable
              onPress={handleRun}
              disabled={loading || !goalText.trim()}
              style={[
                styles.runBtn,
                { backgroundColor: theme.colors.primary, opacity: loading || !goalText.trim() ? 0.6 : 1 },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Sparkles size={15} color="#FFFFFF" />
              )}
              <Text style={styles.runBtnText}>
                {loading ? 'Decomposing Goal...' : 'Auto-Decompose into Quarters, Months & Weeks'}
              </Text>
            </Pressable>

            {/* Plan Preview */}
            {plan && (
              <View
                style={[
                  styles.previewBox,
                  {
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.previewHeader}>
                  <Text style={[styles.previewTitle, { color: theme.colors.primary }]}>
                    Generated Plan ({plan.source})
                  </Text>
                </View>

                {/* Why It Matters */}
                <Text style={[styles.previewSectionLabel, { color: theme.colors.textDark }]}>
                  Why It Matters
                </Text>
                <Text style={[styles.previewBodyText, { color: theme.colors.textMuted }]}>
                  {plan.whyItMatters}
                </Text>

                {/* Milestones */}
                <Text style={[styles.previewSectionLabel, { color: theme.colors.textDark, marginTop: 10 }]}>
                  Quarterly Milestones
                </Text>
                <View style={styles.milestoneGrid}>
                  <Text style={[styles.milestoneItem, { color: theme.colors.textDark }]}>
                    <Text style={{ fontWeight: '700' }}>Q1: </Text>{plan.milestones?.q1}
                  </Text>
                  <Text style={[styles.milestoneItem, { color: theme.colors.textDark }]}>
                    <Text style={{ fontWeight: '700' }}>Q2: </Text>{plan.milestones?.q2}
                  </Text>
                  <Text style={[styles.milestoneItem, { color: theme.colors.textDark }]}>
                    <Text style={{ fontWeight: '700' }}>Q3: </Text>{plan.milestones?.q3}
                  </Text>
                  <Text style={[styles.milestoneItem, { color: theme.colors.textDark }]}>
                    <Text style={{ fontWeight: '700' }}>Q4: </Text>{plan.milestones?.q4}
                  </Text>
                </View>

                {/* Apply Button */}
                <Pressable onPress={handleApply} style={styles.applyBtn}>
                  <Check size={16} color="#FFFFFF" />
                  <Text style={styles.applyBtnText}>Apply Breakdown to Journal</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
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
    fontSize: 17,
    fontWeight: '700',
  },
  scroll: {
    paddingBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  areaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  areaBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  yearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  goalInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  engineBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  engineBadgeTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  engineBadgeSub: {
    fontSize: 10.5,
    marginTop: 1,
  },
  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  runBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  previewBox: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  previewSectionLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  previewBodyText: {
    fontSize: 12,
    lineHeight: 16,
  },
  milestoneGrid: {
    gap: 4,
    marginTop: 4,
  },
  milestoneItem: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  applyBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 14,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
