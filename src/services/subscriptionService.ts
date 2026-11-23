import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, {
  PurchasesPackage,
  PurchasesOfferings,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { CloudUser } from './cloudSyncService';

// Public API keys for RevenueCat (can be overridden via Expo environment variables)
const RC_APPLE_KEY = process.env.EXPO_PUBLIC_RC_APPLE_KEY || 'appl_vYRQKPxXqkMNOmLVLSLdeMkclcT';
const RC_GOOGLE_KEY = process.env.EXPO_PUBLIC_RC_GOOGLE_KEY || 'goog_xHqNsudLlJUbKIGHhNduiMgKTSp';

export const PRO_ENTITLEMENT_ID = 'pro';

let isConfigured = false;

/**
 * Initializes RevenueCat SDK with platform-specific public API key.
 * Safe to call on Web and Expo Go (won't crash).
 */
export async function initSubscriptions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  if (isConfigured) return true;

  try {
    const apiKey = Platform.OS === 'ios' ? RC_APPLE_KEY : RC_GOOGLE_KEY;

    if (!apiKey || apiKey.includes('placeholder')) {
      console.log('[RevenueCat] SDK not configured with live API key yet. Set EXPO_PUBLIC_RC_APPLE_KEY / EXPO_PUBLIC_RC_GOOGLE_KEY.');
    }

    if (__DEV__) {
      await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    } else {
      await Purchases.setLogLevel(LOG_LEVEL.INFO);
    }

    Purchases.configure({ apiKey });
    isConfigured = true;
    return true;
  } catch (error: any) {
    console.warn('[RevenueCat Init Warning]:', error?.message || error);
    return false;
  }
}

/**
 * Associates RevenueCat customer with backend journal user ID (e.g. 42).
 * This binds Apple/Google purchases to the unified account across Web, iOS & Android.
 */
export async function identifyUser(userId: string | number): Promise<void> {
  if (Platform.OS === 'web' || !isConfigured) return;

  try {
    const appUserId = userId.toString();
    await Purchases.logIn(appUserId);
  } catch (error: any) {
    console.warn('[RevenueCat Identify Error]:', error?.message || error);
  }
}

/**
 * Resets the RevenueCat user ID back to anonymous when user logs out.
 */
export async function resetUser(): Promise<void> {
  if (Platform.OS === 'web' || !isConfigured) return;

  try {
    await Purchases.logOut();
  } catch (error: any) {
    console.warn('[RevenueCat Logout Error]:', error?.message || error);
  }
}

/**
 * Fetches available subscription offerings configured in RevenueCat dashboard.
 */
export async function getSubscriptionPackages(): Promise<PurchasesPackage[]> {
  if (Platform.OS === 'web' || !isConfigured) {
    return [];
  }

  try {
    const offerings: PurchasesOfferings = await Purchases.getOfferings();
    if (offerings.current && offerings.current.availablePackages.length > 0) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch (error: any) {
    console.warn('[RevenueCat GetOfferings Error]:', error?.message || error);
    return [];
  }
}

/**
 * Triggers native Apple In-App Purchase or Google Play Billing dialog.
 */
export async function purchaseSubscriptionPackage(
  pkg: PurchasesPackage
): Promise<{ success: boolean; isPro: boolean; message: string }> {
  if (Platform.OS === 'web' || !isConfigured) {
    return {
      success: false,
      isPro: false,
      message: 'In-app purchases are only available on iOS and Android devices.',
    };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const hasPro = typeof customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== 'undefined';

    return {
      success: true,
      isPro: hasPro,
      message: hasPro ? 'Welcome to FRA Journal Pro!' : 'Purchase completed successfully.',
    };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, isPro: false, message: 'Purchase cancelled.' };
    }
    return {
      success: false,
      isPro: false,
      message: error?.message || 'Unable to complete purchase. Please try again.',
    };
  }
}

/**
 * Restores previous in-app purchases (Required by Apple Review Guideline 3.1.2).
 */
export async function restoreUserPurchases(): Promise<{
  success: boolean;
  isPro: boolean;
  message: string;
}> {
  if (Platform.OS === 'web' || !isConfigured) {
    return {
      success: false,
      isPro: false,
      message: 'Restore purchases is only available on iOS and Android native devices.',
    };
  }

  try {
    const customerInfo: CustomerInfo = await Purchases.restorePurchases();
    const hasPro = typeof customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== 'undefined';

    return {
      success: true,
      isPro: hasPro,
      message: hasPro
        ? 'Your Pro subscription has been restored!'
        : 'No active subscription found on this App Store or Google Play account.',
    };
  } catch (error: any) {
    return {
      success: false,
      isPro: false,
      message: error?.message || 'Failed to restore purchases. Please try again later.',
    };
  }
}

/**
 * Checks if user is Pro by cross-referencing:
 * 1. RevenueCat local entitlements (Apple IAP / Google Play)
 * 2. Cloud user subscription status from central backend (Web / Stripe / Paystack)
 */
export async function checkIsUserPro(cloudUser?: CloudUser | null): Promise<boolean> {
  // 1. If cloud user already has verified Pro status from central database:
  if (cloudUser?.is_pro) {
    return true;
  }

  // If cloudUser was not provided, check stored cloud user in local storage
  if (!cloudUser) {
    try {
      const stored = await AsyncStorage.getItem('@ejournal_cloud_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.is_pro) return true;
      }
    } catch {
      // Ignored
    }
  }

  // 2. Check local RevenueCat entitlement (if native)
  if (Platform.OS !== 'web' && isConfigured) {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      if (typeof customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== 'undefined') {
        return true;
      }
    } catch {
      // Ignored
    }
  }

  return false;
}

export interface SubscriptionStatusDetails {
  isPro: boolean;
  platformName: string;
  expirationDate: string | null;
  expirationFormatted: string | null; // e.g. "November 21, 2027 at 11:30 AM"
  willRenew: boolean;
  isLifetime: boolean;
}

function formatSubscriptionDateTime(dateInput: string | Date | null | undefined): string | null {
  if (!dateInput) return null;
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return null;

  const datePart = d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timePart = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${datePart} at ${timePart}`;
}

/**
 * Returns comprehensive subscription metadata including platform,
 * exact expiry/renewal date, and time.
 */
export async function getSubscriptionStatusDetails(
  cloudUser?: CloudUser | null
): Promise<SubscriptionStatusDetails> {
  // 1. Check local RevenueCat entitlement (Apple IAP / Google Play)
  if (Platform.OS !== 'web' && isConfigured) {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID];
      if (entitlement) {
        const store = entitlement.store;
        const platformName =
          store === 'APP_STORE'
            ? 'Apple App Store'
            : store === 'PLAY_STORE'
            ? 'Google Play'
            : store === 'STRIPE'
            ? 'Web / Stripe'
            : 'In-App Purchase';

        const expirationFormatted = entitlement.expirationDate
          ? formatSubscriptionDateTime(entitlement.expirationDate)
          : 'Lifetime Access (Never expires)';

        return {
          isPro: true,
          platformName,
          expirationDate: entitlement.expirationDate,
          expirationFormatted,
          willRenew: entitlement.willRenew,
          isLifetime: !entitlement.expirationDate,
        };
      }
    } catch (e) {
      console.warn('[RevenueCat Details Error]:', e);
    }
  }

  // 2. Check Cloud user subscription status from central backend (Web / Stripe)
  if (cloudUser?.is_pro) {
    const rawEnd = cloudUser.subscription?.current_period_end;
    const platform = cloudUser.subscription?.platform;
    const platformName =
      platform === 'apple_iap'
        ? 'Apple App Store'
        : platform === 'google_play'
        ? 'Google Play'
        : platform === 'stripe'
        ? 'Web / Stripe'
        : 'Cloud Pro Subscription';

    const expirationFormatted = rawEnd
      ? formatSubscriptionDateTime(rawEnd)
      : 'Active (Check store for exact date)';

    return {
      isPro: true,
      platformName,
      expirationDate: rawEnd || null,
      expirationFormatted,
      willRenew: true,
      isLifetime: false,
    };
  }

  return {
    isPro: false,
    platformName: 'Free Starter Plan',
    expirationDate: null,
    expirationFormatted: null,
    willRenew: false,
    isLifetime: false,
  };
}
