// services/purchaseService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import Purchases, {
    CustomerInfo,
    LOG_LEVEL,
    PurchasesOffering,
    PurchasesPackage,
} from 'react-native-purchases';

// RevenueCat API Keys
const REVENUECAT_API_KEY = Platform.select({
  ios: 'YOUR_IOS_API_KEY',
  android: 'YOUR_ANDROID_API_KEY',
}) || '';

const PREMIUM_ENTITLEMENT_ID = 'premium';
const PREMIUM_CACHE_KEY = '@premium_status';

// Expo Go kontrolü
const isExpoGo = Constants.appOwnership === 'expo';

// RevenueCat'i başlat
export async function initializePurchases() {
  // Expo Go'da çalışmayı engelle
  if (isExpoGo) {
    console.log('⚠️ RevenueCat Expo Go içinde çalışmaz. Development build gerekli.');
    return;
  }

  if (!REVENUECAT_API_KEY || REVENUECAT_API_KEY.includes('YOUR_')) {
    console.warn('⚠️ RevenueCat API key henüz ayarlanmamış');
    return;
  }

  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
      });

      console.log('✅ RevenueCat initialized');
    }
  } catch (error) {
    console.error('❌ RevenueCat initialization error:', error);
  }
}

// Kullanıcı premium mi kontrol et
export async function isPremiumUser(): Promise<boolean> {
  // Expo Go'da false döndür
  if (isExpoGo) {
    return false;
  }

  try {
    const cached = await AsyncStorage.getItem(PREMIUM_CACHE_KEY);
    if (cached !== null) {
      return cached === 'true';
    }

    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;

    await AsyncStorage.setItem(PREMIUM_CACHE_KEY, isPremium.toString());

    return isPremium;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}

// Mevcut teklifleri getir
export async function getOfferings(): Promise<PurchasesOffering | null> {
  // Expo Go'da mock data döndür
  if (isExpoGo) {
    console.log('⚠️ Expo Go - Mock offering data döndürülüyor');
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null) {
      return offerings.current;
    }
    return null;
  } catch (error) {
    console.error('Error getting offerings:', error);
    return null;
  }
}

// Satın alma yap
export async function purchasePackage(
  packageToBuy: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  // Expo Go'da simüle et
  if (isExpoGo) {
    return { 
      success: false, 
      error: 'Satın alma için development build gerekli. Expo Go desteklemiyor.' 
    };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToBuy);
    
    const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
    await AsyncStorage.setItem(PREMIUM_CACHE_KEY, isPremium.toString());

    return { success: true, customerInfo };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, error: 'Satın alma iptal edildi' };
    }
    console.error('Purchase error:', error);
    return { success: false, error: error.message || 'Satın alma başarısız' };
  }
}

// Satın almaları geri yükle
export async function restorePurchases(): Promise<{
  success: boolean;
  isPremium: boolean;
  error?: string;
}> {
  // Expo Go'da simüle et
  if (isExpoGo) {
    return { 
      success: false, 
      isPremium: false, 
      error: 'Geri yükleme için development build gerekli' 
    };
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;

    await AsyncStorage.setItem(PREMIUM_CACHE_KEY, isPremium.toString());

    return { success: true, isPremium };
  } catch (error: any) {
    console.error('Restore error:', error);
    return { success: false, isPremium: false, error: error.message };
  }
}

// Premium durumunu cache'den temizle
export async function clearPremiumCache(): Promise<void> {
  await AsyncStorage.removeItem(PREMIUM_CACHE_KEY);
}

// Kullanıcı ID'si ayarla
export async function identifyUser(userId: string): Promise<void> {
  if (isExpoGo) return;

  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error('Error identifying user:', error);
  }
}

// Kullanıcı çıkışı
export async function logoutUser(): Promise<void> {
  if (isExpoGo) return;

  try {
    await Purchases.logOut();
    await clearPremiumCache();
  } catch (error) {
    console.error('Error logging out:', error);
  }
}