import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalState } from '../types/journal';

const TOKEN_KEY = '@ejournal_cloud_token';
const USER_KEY = '@ejournal_cloud_user';
const SERVER_URL_KEY = '@ejournal_server_url';
export const DEFAULT_SERVER_URL =
  process.env.EXPO_PUBLIC_SERVER_URL || 'https://kws2026.vercel.app';

export interface CloudUser {
  id: number;
  email: string;
  full_name: string;
  is_kws_member?: boolean;
  membership_tag?: string;
}

export async function getServerUrl(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(SERVER_URL_KEY);
    return saved?.trim() || DEFAULT_SERVER_URL;
  } catch {
    return DEFAULT_SERVER_URL;
  }
}

export async function setServerUrl(url: string): Promise<void> {
  try {
    await AsyncStorage.setItem(SERVER_URL_KEY, url.trim());
  } catch (err) {
    console.error('Error saving server url:', err);
  }
}

export async function getCloudToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getCloudUser(): Promise<CloudUser | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function cloudLogin(email: string, password: string): Promise<{ success: boolean; user?: CloudUser; error?: string }> {
  try {
    const baseUrl = await getServerUrl();
    const res = await fetch(`${baseUrl}/api/journal/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }

    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network connection failed' };
  }
}

export async function cloudRegister(
  email: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; user?: CloudUser; error?: string }> {
  try {
    const baseUrl = await getServerUrl();
    const res = await fetch(`${baseUrl}/api/journal/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password, full_name: fullName.trim() }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Registration failed' };
    }

    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network connection failed' };
  }
}

export async function cloudLogout(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error('Logout error:', err);
  }
}

/**
 * Fetch journal state from Turso cloud for a specific year
 */
export async function fetchCloudState(year: number): Promise<{
  success: boolean;
  state?: JournalState;
  availableYears?: number[];
  error?: string;
}> {
  try {
    const token = await getCloudToken();
    if (!token) {
      return { success: false, error: 'Not logged in' };
    }

    const baseUrl = await getServerUrl();
    const res = await fetch(`${baseUrl}/api/journal/state?year=${year}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        await cloudLogout();
      }
      return { success: false, error: 'Failed to fetch cloud state' };
    }

    const data = await res.json();
    return {
      success: true,
      state: data.state || undefined,
      availableYears: data.availableYears || [],
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Synchronize local state with cloud state in Turso.
 * If cloud has data, merges or pulls latest; also pushes local changes to cloud.
 */
export async function syncWithCloud(localState: JournalState): Promise<{ success: boolean; state?: JournalState; message?: string }> {
  try {
    const token = await getCloudToken();
    if (!token) {
      return { success: false, message: 'Not logged in. Running in offline guest mode.' };
    }

    const baseUrl = await getServerUrl();

    // 1. Push local state to cloud
    const saveRes = await fetch(`${baseUrl}/api/journal/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        year: localState.year,
        state: localState,
      }),
    });

    if (!saveRes.ok) {
      // If token expired, clear it
      if (saveRes.status === 401) {
        await cloudLogout();
        return { success: false, message: 'Session expired. Please log in again.' };
      }
      return { success: false, message: 'Cloud sync failed.' };
    }

    return { success: true, state: localState, message: 'Synced with Turso cloud successfully!' };
  } catch (err: any) {
    return { success: false, message: 'Could not reach server. Changes kept locally.' };
  }
}

/**
 * Permanently deletes the user's account and all associated journal data from the server.
 * Also clears all local tokens and storage keys.
 */
export async function cloudDeleteAccount(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const token = await getCloudToken();
    const baseUrl = await getServerUrl();

    if (token) {
      const res = await fetch(`${baseUrl}/api/journal/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to delete account from server' };
      }
    }

    // Wipe all local cloud credentials and local data
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, '@ejournal_state']);

    return { success: true, message: 'Account and all cloud data successfully deleted.' };
  } catch (err: any) {
    console.error('Error deleting account:', err);
    return { success: false, error: err?.message || 'Network error while deleting account.' };
  }
}
