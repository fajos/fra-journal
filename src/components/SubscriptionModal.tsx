import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { Text } from './AppText';
import {
  Sparkles,
  ShieldCheck,
  Cloud,
  Bell,
  Printer,
  X,
  RotateCcw,
  ExternalLink,
  FileText,
  Lock,
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

  // Find annual package from RevenueCat or fallback to $6.99/year
  const annualPkg = packages.find(
    (p) =>
      p.packageType === 'ANNUAL' ||
      p.identifier.toLowerCase().includes('annual') ||
      p.identifier.toLowerCase().includes('year')
  ) || packages[0];

  const annualPrice = annualPkg?.product?.priceString || '$6.99 / year';

  const handlePurchase = async () => {
    hapticFeedback.selection();
    setLoading(true);

    if (!annualPkg) {
      setLoading(false);
      showStatus('In-app purchase packages are syncing with the store. Please try again in a moment.');
      return;
    }

    const res = await purchaseSubscriptionPackage(annualPkg);
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
                  'Deepen your focus, unlock intelligent annual planning, and keep your life reflections backed up and accessible across Web, iOS, and Android.'}
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
                  title: 'Unlimited Intelligent Goal Decompositions',
                  desc: 'Automatically break yearly goals into quarterly milestones, monthly targets, and weekly action steps.',
                },
                {
                  icon: Cloud,
                  title: 'Unified Multi-Device Cloud Sync',
                  desc: 'Subscribe once, use everywhere on Web, iPhone, iPad, and Android with automatic cloud backup.',
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
                  desc: 'Protect deep reflections with Face ID / Fingerprint and archive unlimited future and past years.',
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

            {/* Single Annual Subscription Card ($6.99 / Year) */}
            <View
              style={[
                styles.planCard,
                {
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.primaryLight,
                },
              ]}
            >
              <View style={styles.planHeaderRow}>
                <View style={[styles.planIconWrap, { backgroundColor: theme.colors.primary }]}>
                  <Sparkles size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.planTitleRow}>
                    <Text
                      style={[
                        styles.planTitle,
                        { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif },
                      ]}
                    >
                      Annual Pro Access
                    </Text>
                    <View style={[styles.savingsBadge, { backgroundColor: '#16A34A' }]}>
                      <Text style={styles.savingsBadgeText}>ALL-INCLUSIVE</Text>
                    </View>
                  </View>
                  <Text style={[styles.planPriceSub, { color: theme.colors.textMuted }]}>
                    $6.99 billed annually • Just ~$0.58 / month
                  </Text>
                  <Text style={[styles.planScopeSub, { color: theme.colors.primary }]}>
                    ✓ Works on iOS, Android & Web
                  </Text>
                </View>
                <View style={styles.priceCol}>
                  <Text style={[styles.planPrice, { color: theme.colors.primary }]}>{annualPrice}</Text>
                  <Text style={[styles.priceTerm, { color: theme.colors.textMuted }]}>per year</Text>
                </View>
              </View>
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
                    Subscribe for {annualPrice}
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
                  <RotateCcw size={13} color={theme.colors.textMuted} />
                  <Text style={[styles.restoreBtnText, { color: theme.colors.textMuted }]}>
                    Already subscribed? Restore Purchases
                  </Text>
                </View>
              )}
            </Pressable>

            {/* Prominent Legal Links: Terms of Use & Privacy Policy */}
            <View style={[styles.legalLinksCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.cardBorder }]}>
              <Text style={[styles.legalCardHeader, { color: theme.colors.textDark }]}>
                Legal & Subscription Information
              </Text>
              <View style={styles.legalButtonsRow}>
                <Pressable
                  onPress={() => openUrl('https://kws2026.vercel.app/terms')}
                  style={[styles.legalButton, { borderColor: theme.colors.cardBorder }]}
                >
                  <FileText size={13} color={theme.colors.primary} />
                  <Text style={[styles.legalButtonText, { color: theme.colors.primary }]}>Terms of Use (EULA)</Text>
                  <ExternalLink size={11} color={theme.colors.textMuted} />
                </Pressable>

                <Pressable
                  onPress={() => openUrl('https://kws2026.vercel.app/privacy')}
                  style={[styles.legalButton, { borderColor: theme.colors.cardBorder }]}
                >
                  <Lock size={13} color={theme.colors.primary} />
                  <Text style={[styles.legalButtonText, { color: theme.colors.primary }]}>Privacy Policy</Text>
                  <ExternalLink size={11} color={theme.colors.textMuted} />
                </Pressable>
              </View>

              <Text style={[styles.legalText, { color: theme.colors.textLight }]}>
                Subscription automatically renews annually for $6.99 unless cancelled at least 24 hours before the end of the current billing cycle. Payment will be charged to your {Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'} account at confirmation of purchase. You can manage or cancel your subscription at any time in your {Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'} account settings.
              </Text>
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
    maxHeight: '92%',
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
    paddingBottom: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
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
    fontSize: 23,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
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
    paddingVertical: 12,
    marginVertical: 10,
    gap: 11,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    marginTop: 2,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  planCard: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
  },
  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  savingsBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savingsBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  planPriceSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  planScopeSub: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  priceCol: {
    alignItems: 'flex-end',
    marginLeft: 6,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  priceTerm: {
    fontSize: 10,
    fontWeight: '500',
  },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
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
  legalLinksCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  legalCardHeader: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  legalButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  legalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: '#FFFFFF',
  },
  legalButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  legalText: {
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
});
