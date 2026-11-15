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

export async function authenticateWithBiometrics(
  promptMessage: string = 'Unlock your private journal'
): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  try {
    const isAvailable = await isBiometricsAvailable();
    if (!isAvailable) return true;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use Passcode',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (e) {
    console.warn('Biometric authentication error:', e);
    return false;
  }
}
