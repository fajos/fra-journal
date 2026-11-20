import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export async function isBiometricsAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch (e) {
    return false;
  }
}

/**
 * Returns a human-friendly name of the biometric modality supported by this device
 * (e.g. 'Face ID', 'Touch ID', 'Fingerprint', 'Face Unlock').
 */
export async function getBiometricLabel(): Promise<string> {
  if (Platform.OS === 'web') return 'Passcode';
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris Scanner';
    }
    return 'Passcode';
  } catch {
    return 'Biometrics';
  }
}

export async function authenticateWithBiometrics(
  customPromptMessage?: string
): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  try {
    const isAvailable = await isBiometricsAvailable();
    if (!isAvailable) return true;

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);

    let prompt = customPromptMessage;
    if (!prompt) {
      if (hasFace) {
        prompt = Platform.OS === 'ios' ? 'Unlock with Face ID' : 'Unlock with Face Recognition';
      } else if (hasFingerprint) {
        prompt = Platform.OS === 'ios' ? 'Scan Touch ID to unlock' : 'Touch fingerprint sensor to unlock';
      } else {
        prompt = 'Unlock your private journal';
      }
    }

    const authOptions: LocalAuthentication.LocalAuthenticationOptions = {
      promptMessage: prompt,
      cancelLabel: 'Cancel',
      fallbackLabel: 'Enter Passcode',
      disableDeviceFallback: false,
    };

    if (Platform.OS === 'android') {
      authOptions.promptSubtitle = 'Confirm biometric identity';
      authOptions.promptDescription = hasFace
        ? 'Scan face or use sensor to unlock'
        : 'Touch fingerprint sensor to unlock';
      authOptions.biometricsSecurityLevel = 'weak';
    }

    const result = await LocalAuthentication.authenticateAsync(authOptions);

    return result.success;
  } catch (e) {
    console.warn('Biometric authentication error:', e);
    return false;
  }
}
