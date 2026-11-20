import { getServerUrl, getCloudToken } from './cloudSyncService';

export interface ReminderSettings {
  frequency: 'weekly' | 'daily' | 'monthly' | 'disabled';
  day_of_week: string;
  time_of_day: string;
  email: string;
}

export async function fetchReminderSettings(): Promise<ReminderSettings | null> {
  try {
    const token = await getCloudToken();
    if (!token) return null;

    const baseUrl = await getServerUrl();
    const res = await fetch(`${baseUrl}/api/journal/reminders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      return data.reminder || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveReminderSettings(
  settings: Partial<ReminderSettings>
): Promise<{ success: boolean; message?: string }> {
  try {
    const token = await getCloudToken();
    if (!token) {
      return { success: false, message: 'Must be logged in to configure email reminders' };
    }

    const baseUrl = await getServerUrl();
    const res = await fetch(`${baseUrl}/api/journal/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });

    const data = await res.json();
    return { success: res.ok, message: data.message || (res.ok ? 'Settings saved' : 'Failed') };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error' };
  }
}

export async function sendTestReminder(): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getCloudToken();
    if (!token) {
      return { success: false, message: 'Must be logged in to trigger email reminders' };
    }

    const baseUrl = await getServerUrl();
    const res = await fetch(`${baseUrl}/api/journal/reminders/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    return {
      success: res.ok,
      message: data.message || (res.ok ? 'Reminder sent' : 'Failed to send'),
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error' };
  }
}
