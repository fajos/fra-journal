import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up default in-app notification presentation handler
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export interface ReminderItem {
  id: string;
  title: string;
  body: string;
  targetDate: string; // ISO date string
  type: 'milestone' | 'weekly_cadence' | 'monthly_review' | 'custom';
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (e) {
    console.warn('Error requesting notification permissions:', e);
    return false;
  }
}

export async function scheduleMilestoneReminder(
  milestoneTitle: string,
  goalArea: string,
  triggerDate: Date
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  try {
    if (Platform.OS === 'web') {
      // On web, if within current session or alert
      return 'web_scheduled';
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🌱 Milestone Check-in: ${goalArea}`,
        body: milestoneTitle,
        data: { goalArea, milestoneTitle },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return id;
  } catch (err) {
    console.warn('Failed to schedule milestone notification:', err);
    return null;
  }
}

export async function scheduleWeeklyPlanningCadence(
  hour: number = 19,
  minute: number = 0
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  try {
    if (Platform.OS === 'web') return 'web_cadence';

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📖 Sunday Reflection & Weekly Planning',
        body: "Time to reflect on last week's wins and set your Top 3 Priorities for the week ahead.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1, // Sunday
        hour,
        minute,
      },
    });
    return id;
  } catch (err) {
    console.warn('Failed to schedule weekly planning notification:', err);
    return null;
  }
}

export async function scheduleMonthlyReviewCadence(
  hour: number = 18,
  minute: number = 0
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  try {
    if (Platform.OS === 'web') return 'web_monthly';

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🪞 Month in Review',
        body: 'Close out your monthly journey: celebrate your wins, identify what got in the way, and carry forward unfinished goals.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: 28, // Near month end
        hour,
        minute,
      },
    });
    return id;
  } catch (err) {
    console.warn('Failed to schedule monthly review notification:', err);
    return null;
  }
}
