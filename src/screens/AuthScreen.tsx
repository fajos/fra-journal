import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, TextInput } from '../components/AppText';
import { useTheme } from '../context/ThemeContext';
import { CloudUser, cloudLogin, cloudRegister, getServerUrl, setServerUrl } from '../services/cloudSyncService';
import { hapticFeedback } from '../services/hapticsService';
import { BookOpen, Cloud, Lock, Mail, User, ShieldCheck, Globe, ChevronDown, ChevronUp } from 'lucide-react-native';

interface AuthScreenProps {
  onAuthenticated: (user: CloudUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const { theme, isDark } = useTheme();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (authMode === 'register' && !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    hapticFeedback.medium();
    setLoading(true);

    try {
      const res =
        authMode === 'login'
          ? await cloudLogin(email, password)
          : await cloudRegister(email, password, fullName);

      if (res.success && res.user) {
        hapticFeedback.success();
        onAuthenticated(res.user);
      } else {
        hapticFeedback.error();
        setErrorMsg(res.error || 'Authentication failed. Please check credentials or network.');
      }
    } catch (err: any) {
      hapticFeedback.error();
      setErrorMsg(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View
          style={[
            styles.authCard,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryLight }]}>
              <BookOpen size={28} color={theme.colors.primary} />
            </View>
            <Text style={[styles.kwsBadge, { color: theme.colors.primary }]}>
              ANNUAL LIFE PLANNER • FINISH RICH AFRICA
            </Text>
            <Text
              style={[
                styles.title,
                { color: theme.colors.textDark, fontFamily: theme.typography.fontFamilySerif },
              ]}
            >
              Reflective E-Journal
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Sign in or create an account to unlock your private annual journal. All entries are backed up and synced to your cloud storage.
            </Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View
            style={[
              styles.tabRow,
              { backgroundColor: theme.colors.linedPaper, borderColor: theme.colors.cardBorder },
            ]}
          >
            <Pressable
              onPress={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
              style={[
                styles.tabBtn,
                authMode === 'login' && [styles.tabBtnActive, { backgroundColor: theme.colors.primary }],
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: authMode === 'login' ? '#FFFFFF' : theme.colors.textMuted },
                ]}
              >
                Sign In
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setAuthMode('register');
                setErrorMsg('');
              }}
              style={[
                styles.tabBtn,
                authMode === 'register' && [styles.tabBtnActive, { backgroundColor: theme.colors.primary }],
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: authMode === 'register' ? '#FFFFFF' : theme.colors.textMuted },
                ]}
              >
                Create Account
              </Text>
            </Pressable>
          </View>

          {/* Error Banner */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Form Inputs */}
          <View style={styles.form}>
            {authMode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textDark }]}>Full Name</Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.colors.primaryLight,
                      borderColor: theme.colors.cardBorder,
                    },
                  ]}
                >
                  <User size={16} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="e.g. Samuel Adeyemi"
                    placeholderTextColor={theme.colors.textLight}
                    style={[styles.input, { color: theme.colors.textDark }]}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textDark }]}>Email Address</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
              >
                <Mail size={16} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor={theme.colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { color: theme.colors.textDark }]}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textDark }]}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
              >
                <Lock size={16} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textLight}
                  secureTextEntry
                  style={[styles.input, { color: theme.colors.textDark }]}
                />
              </View>
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={[
                styles.submitBtn,
                { backgroundColor: theme.colors.primary, opacity: loading ? 0.7 : 1 },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Cloud size={16} color="#FFFFFF" />
              )}
              <Text style={styles.submitBtnText}>
                {authMode === 'login' ? 'Sign In & Open Journal' : 'Create Account & Enter Journal'}
              </Text>
            </Pressable>
          </View>

          {/* Privacy Footnote */}
          <View style={styles.footnoteRow}>
            <ShieldCheck size={14} color={theme.colors.primary} />
            <Text style={[styles.footnoteText, { color: theme.colors.textMuted }]}>
              Secure cloud backup &amp; bi-directional multi-device sync.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 22,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  kwsBadge: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FDE8E8',
    borderColor: '#F8B4B4',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#C81E1E',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  form: {
    gap: 12,
  },
  inputGroup: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13.5,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  serverToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 18,
    paddingVertical: 4,
  },
  serverToggleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  serverConfigBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  serverConfigLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  serverInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 11,
  },
  footnoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footnoteText: {
    fontSize: 10.5,
    textAlign: 'center',
  },
});
