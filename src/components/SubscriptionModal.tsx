import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import {
  Sparkles,
  Check,
  ShieldCheck,
  Cloud,
  Bell,
  Printer,
  X,
  RotateCcw,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { hapticFeedback } from '../services/hapticsService';
import {
  getSubscriptionPackages,
  purchaseSubscriptionPackage,
  restoreUserPurchases,
} from '../services/subscriptionService';
import { PurchasesPackage } from 'react-native-purchases';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  featureReason?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  onClose,
  onSuccess,
  featureReason,
}) => {
  const { theme } = useTheme();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  const loadOfferings = async () => {
    const pkgs = await getSubscriptionPackages();
    setPackages(pkgs);
  };

  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 4500);
  };

  // Find annual and monthly package from RevenueCat or fallback
  const annualPkg = packages.find(
    (p) =>
      p.packageType === 'ANNUAL' ||
      p.identifier.toLowerCase().includes('annual') ||
      p.identifier.toLowerCase().includes('year')
  );
  const monthlyPkg = packages.find(
    (p) =>
      p.packageType === 'MONTHLY' ||
      p.identifier.toLowerCase().includes('monthly') ||
      p.identifier.toLowerCase().includes('month')
  );

  const annualPrice = annualPkg?.product?.priceString || '$39.99/yr';
  const monthlyPrice = monthlyPkg?.product?.priceString || '$4.99/mo';

  const handlePurchase = async () => {
    hapticFeedback.selection();
    setLoading(true);

    const pkgToBuy = selectedPlan === 'annual' ? (annualPkg || packages[0]) : (monthlyPkg || packages[0]);

    if (!pkgToBuy) {
      setLoading(false);
      showStatus('In-app purchase packages are currently syncing with app stores. Please try again in a moment.');
      return;
    }

    const res = await purchaseSubscriptionPackage(pkgToBuy);
    setLoading(false);

    if (res.success && res.isPro) {
      hapticFeedback.success();
      showStatus(res.message);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } else {
      hapticFeedback.error();
      showStatus(res.message);
    }
  };

  const handleRestore = async () => {
    hapticFeedback.selection();
    setRestoring(true);
    const res = await restoreUserPurchases();
    setRestoring(false);

    if (res.isPro) {
      hapticFeedback.success();
      showStatus(res.message);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } else {
      showStatus(res.message);
    }
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
          {/* Close button */}
          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.colors.linedPaper }]}>
            <X size={18} color={theme.colors.textDark} />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Header Badge & Title */}
            <View style={styles.header}>
              <View style={[styles.proBadge, { backgroundColor: theme.colors.primaryLight }]}>
                <Sparkles size={14} color={theme.colors.primary} />
                <Text style={[styles.proBadgeText, { color: theme.colors.primary }]}>PRO MEMBERSHIP</Text>
              </View>
              <Text
                style={[
                  styles.title,
                  { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif },
                ]}
              >
                Reflective E-Journal Pro
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                {featureReason ||
                  'Deepen your focus, unlock intelligent annual planning, and keep your journals synced securely across all your devices.'}
              </Text>
            </View>

            {/* Status notification */}
            {statusMsg && (
              <View style={[styles.statusBox, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={[styles.statusText, { color: theme.colors.primary }]}>{statusMsg}</Text>
              </View>
            )}

            {/* Feature Checklist */}
            <View style={[styles.featuresBox, { borderColor: theme.colors.linedPaper }]}>
              {[
                {
                  icon: Sparkles,
                  title: 'Unlimited Intelligent Goal Breakdowns',
                  desc: 'Automatically break yearly goals into quarterly milestones, monthly targets, and weekly action steps.',
                },
                {
                  icon: Cloud,
                  title: 'Unified Multi-Device Cloud Sync',
                  desc: 'Subscribe once, use everywhere on iOS, Android, and Web with real-time cloud backup.',
                },
                {
                  icon: Printer,
                  title: 'Annual Keepsake PDF Booklet',
                  desc: 'Export high-resolution, editorial print-ready journals of your milestones and reflections.',
                },
                {
                  icon: Bell,
                  title: 'Automated Cadence & Email Reminders',
                  desc: 'Receive Sunday planning and month-end reflection check-ins directly in your inbox.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Biometric Security & Infinite Archives',
                  desc: 'Protect deep reflections with Face ID/Fingerprint and archive unlimited future and past years.',
                },
              ].map((f, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <View style={[styles.featureIconWrap, { backgroundColor: theme.colors.primaryLight }]}>
                    <f.icon size={16} color={theme.colors.primary} />
                  </View>
                  <View style={styles.featureTextWrap}>
                    <Text style={[styles.featureTitle, { color: theme.colors.textDark }]}>{f.title}</Text>
                    <Text style={[styles.featureDesc, { color: theme.colors.textMuted }]}>{f.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Subscription Plan Switcher */}
            <View style={styles.plansContainer}>
              {/* Annual Plan (Best Value) */}
              <Pressable
                onPress={() => {
                  hapticFeedback.selection();
                  setSelectedPlan('annual');
                }}
                style={[
                  styles.planCard,
                  {
                    borderColor: selectedPlan === 'annual' ? theme.colors.primary : theme.colors.cardBorder,
                    backgroundColor:
                      selectedPlan === 'annual' ? theme.colors.primaryLight : theme.colors.cardBackground,
                  },
                ]}
              >
                <View style={styles.planHeaderRow}>
                  <View style={styles.radioOuter}>
                    {selectedPlan === 'annual' && (
                      <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={styles.planTitleRow}>
                      <Text style={[styles.planTitle, { color: theme.colors.textDark }]}>Annual Access</Text>
                      <View style={[styles.savingsBadge, { backgroundColor: '#16A34A' }]}>
                        <Text style={styles.savingsBadgeText}>SAVE 33% • BEST VALUE</Text>
                      </View>
                    </View>
                    <Text style={[styles.planPriceSub, { color: theme.colors.textMuted }]}>
                      Billed annually • Works on Web, iOS & Android
                    </Text>
                  </View>
                  <Text style={[styles.planPrice, { color: theme.colors.primary }]}>{annualPrice}</Text>
                </View>
              </Pressable>

              {/* Monthly Plan */}
              <Pressable
                onPress={() => {
                  hapticFeedback.selection();
                  setSelectedPlan('monthly');
                }}
                style={[
                  styles.planCard,
                  {
                    borderColor: selectedPlan === 'monthly' ? theme.colors.primary : theme.colors.cardBorder,
                    backgroundColor:
                      selectedPlan === 'monthly' ? theme.colors.primaryLight : theme.colors.cardBackground,
                  },
                ]}
              >
                <View style={styles.planHeaderRow}>
                  <View style={styles.radioOuter}>
                    {selectedPlan === 'monthly' && (
                      <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.planTitle, { color: theme.colors.textDark }]}>Monthly Plan</Text>
                    <Text style={[styles.planPriceSub, { color: theme.colors.textMuted }]}>
                      Billed monthly • Cancel anytime
                    </Text>
                  </View>
                  <Text style={[styles.planPrice, { color: theme.colors.primary }]}>{monthlyPrice}</Text>
                </View>
              </Pressable>
            </View>

            {/* CTA Subscribe Button */}
            <Pressable
              onPress={handlePurchase}
              disabled={loading}
              style={[styles.subscribeBtn, { backgroundColor: theme.colors.primary }]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Sparkles size={16} color="#FFFFFF" />
                  <Text style={styles.subscribeBtnText}>
                    {selectedPlan === 'annual' ? `Start Annual Plan (${annualPrice})` : `Subscribe (${monthlyPrice})`}
                  </Text>
                </>
              )}
            </Pressable>

            {/* Restore Purchases (Apple App Store Requirement) */}
            <Pressable onPress={handleRestore} disabled={restoring} style={styles.restoreBtn}>
              {restoring ? (
                <ActivityIndicator size="small" color={theme.colors.textMuted} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <RotateCcw size={12} color={theme.colors.textMuted} />
                  <Text style={[styles.restoreBtnText, { color: theme.colors.textMuted }]}>
                    Already subscribed? Restore Purchases
                  </Text>
                </View>
              )}
            </Pressable>

            {/* Legal Disclosures (Apple Review Mandatory Guidelines 3.1.2) */}
            <View style={styles.legalSection}>
              <Text style={[styles.legalText, { color: theme.colors.textLight }]}>
                Subscription automatically renews unless cancelled at least 24 hours before the end of the current
                billing period. Payment will be charged to your {Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'}{' '}
                account. You can manage or cancel your subscription at any time in your account settings.
              </Text>

              <View style={styles.legalLinksRow}>
                <Pressable onPress={() => openUrl('https://kws2026.vercel.app/terms')}>
                  <Text style={[styles.legalLink, { color: theme.colors.primary }]}>Terms of Service</Text>
                </Pressable>
                <Text style={{ color: theme.colors.textLight }}>•</Text>
                <Pressable onPress={() => openUrl('https://kws2026.vercel.app/privacy')}>
                  <Text style={[styles.legalLink, { color: theme.colors.primary }]}>Privacy Policy</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  statusBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  featuresBox: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 14,
    marginVertical: 12,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  plansContainer: {
    gap: 10,
    marginVertical: 14,
  },
  planCard: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
  },
  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  planTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  savingsBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savingsBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  planPriceSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  planPrice: {
    fontSize: 15,
    fontWeight: '800',
  },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  subscribeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  restoreBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  restoreBtnText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  legalSection: {
    marginTop: 4,
    alignItems: 'center',
  },
  legalText: {
    fontSize: 10.5,
    lineHeight: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: {
    fontSize: 11,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
