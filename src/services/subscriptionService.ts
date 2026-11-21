import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  PurchasesOfferings,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { CloudUser } from './cloudSyncService';

// Public API keys for RevenueCat (can be overridden via Expo environment variables)
const RC_APPLE_KEY = process.env.EXPO_PUBLIC_RC_APPLE_KEY || 'appl_placeholder_key';
const RC_GOOGLE_KEY = process.env.EXPO_PUBLIC_RC_GOOGLE_KEY || 'goog_placeholder_key';

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
      message: hasPro ? 'Welcome to Reflective E-Journal Pro!' : 'Purchase completed successfully.',
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
