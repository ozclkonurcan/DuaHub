// services/notificationService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  morningDua: {
    enabled: boolean;
    time: string; // "07:00"
  };
  eveningDua: {
    enabled: boolean;
    time: string; // "18:00"
  };
  prayerTimes: {
    enabled: boolean;
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  ramadan: {
    enabled: boolean;
    iftar: boolean;
    sahur: boolean;
  };
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  morningDua: {
    enabled: true,
    time: '07:00',
  },
  eveningDua: {
    enabled: true,
    time: '18:00',
  },
  prayerTimes: {
    enabled: true,
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  ramadan: {
    enabled: true,
    iftar: true,
    sahur: true,
  },
};

// Bildirim ayarlarını yapılandır
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Bildirim izni iste
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Bildirimler sadece fiziksel cihazlarda çalışır');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Bildirim izni reddedildi');
    return null;
  }

  // Android için bildirim kanalı oluştur
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });

    // Namaz vakitleri için özel kanal
    await Notifications.setNotificationChannelAsync('prayer-times', {
      name: 'Namaz Vakitleri',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });

    // Ramazan için özel kanal
    await Notifications.setNotificationChannelAsync('ramadan', {
      name: 'Ramazan',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return 'granted';
}

// Ayarları kaydet
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Bildirim ayarları kaydedilemedi:', error);
  }
}

// Ayarları yükle
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Bildirim ayarları yüklenemedi:', error);
    return DEFAULT_SETTINGS;
  }
}

// Sabah duası bildirimi planla
export async function scheduleMorningDua(time: string): Promise<void> {
  const [hours, minutes] = time.split(':').map(Number);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌅 Sabah Duası Zamanı',
      body: 'Güne güzel bir dua ile başlayın!',
      sound: 'default',
      data: { type: 'morning-dua' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });
}

// Akşam duası bildirimi planla
export async function scheduleEveningDua(time: string): Promise<void> {
  const [hours, minutes] = time.split(':').map(Number);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌙 Akşam Duası Zamanı',
      body: 'Günü güzel bir dua ile tamamlayın!',
      sound: 'default',
      data: { type: 'evening-dua' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });
}

// Namaz vakti bildirimi planla
export async function schedulePrayerNotification(
  prayerName: string,
  hour: number,
  minute: number
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🕌 ${prayerName} Vakti`,
      body: `${prayerName} namazı vakti girdi`,
      sound: 'default',
      data: { type: 'prayer-time', prayer: prayerName },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });
}

// İftar bildirimi planla
export async function scheduleIftarNotification(hour: number, minute: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌙 İftar Vakti',
      body: 'Hayırlı iftarlar! Oruç açma duasını okumayı unutmayın.',
      sound: 'default',
      data: { type: 'iftar' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });
}

// Sahur bildirimi planla
export async function scheduleSahurNotification(hour: number, minute: number): Promise<void> {
  // Sahurdan 30 dakika önce uyar
  const sahurTime = new Date();
  sahurTime.setHours(hour, minute - 30, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌅 Sahur Vakti Yaklaşıyor',
      body: '30 dakika içinde imsak vakti! Sahur yapın ve niyet edin.',
      sound: 'default',
      data: { type: 'sahur' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: sahurTime.getHours(),
      minute: sahurTime.getMinutes(),
      repeats: true,
    },
  });
}

// Tüm bildirimleri iptal et
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Belirli bir bildirimi iptal et
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

// Zamanlı bildirim oluştur (özel hatırlatıcı için)
export async function scheduleCustomNotification(
  title: string,
  body: string,
  date: Date
): Promise<string> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: { type: 'custom' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });

  return identifier;
}

// Zamanlanmış bildirimleri listele
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}