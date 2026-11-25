import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import appConfig from '../../app.json';

export interface UpdateStatusInfo {
  isEnabled: boolean;
  channel: string | null;
  updateId: string | null;
  runtimeVersion: string | null;
  createdAt: Date | null;
  isEmbeddedLaunch: boolean;
}

export interface CheckUpdateResult {
  success: boolean;
  isAvailable: boolean;
  isNew: boolean;
  message: string;
}

/**
 * Returns the configured semantic application version (e.g. "1.1.0").
 */
export function getAppVersion(): string {
  return (
    Constants.expoConfig?.version ||
    (Constants as any).manifest?.version ||
    (appConfig as any)?.expo?.version ||
    '1.1.0'
  );
}

/**
 * Returns current status of OTA updates for this installation.
 */
export function getUpdatesStatus(): UpdateStatusInfo {
  if (Platform.OS === 'web') {
    return {
      isEnabled: false,
      channel: null,
      updateId: null,
      runtimeVersion: null,
      createdAt: null,
      isEmbeddedLaunch: true,
    };
  }

  try {
    return {
      isEnabled: Updates.isEnabled,
      channel: Updates.channel,
      updateId: Updates.updateId,
      runtimeVersion: Updates.runtimeVersion,
      createdAt: Updates.createdAt,
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
    };
  } catch {
    return {
      isEnabled: false,
      channel: null,
      updateId: null,
      runtimeVersion: null,
      createdAt: null,
      isEmbeddedLaunch: true,
    };
  }
}

/**
 * Checks the Expo Updates server for new over-the-air updates.
 * If found, automatically fetches/downloads the bundle.
 */
export async function checkForAppUpdates(): Promise<CheckUpdateResult> {
  if (Platform.OS === 'web') {
    return {
      success: true,
      isAvailable: false,
      isNew: false,
      message: 'Web apps update automatically on page refresh.',
    };
  }

  if (!Updates.isEnabled) {
    return {
      success: true,
      isAvailable: false,
      isNew: false,
      message: 'Over-the-air updates are active in standalone, test, and App Store builds.',
    };
  }

  try {
    const check = await Updates.checkForUpdateAsync();
    if (check.isAvailable) {
      const fetchResult = await Updates.fetchUpdateAsync();
      return {
        success: true,
        isAvailable: true,
        isNew: fetchResult.isNew,
        message: 'A new update is ready! Restart the app to apply it.',
      };
    } else {
      return {
        success: true,
        isAvailable: false,
        isNew: false,
        message: 'Your journal is running the latest version.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      isAvailable: false,
      isNew: false,
      message: err?.message || 'Unable to check for updates right now.',
    };
  }
}

/**
 * Restarts the app to launch the newly downloaded update bundle.
 */
export async function reloadAppAsync(): Promise<void> {
  if (Updates.isEnabled) {
    await Updates.reloadAsync();
  }
}
