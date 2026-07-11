/**
 * expo-notifications yapıştırma katmanı.
 * Tüm vakit bildirimleri YEREL zamanlanır (push değil) — internet/sunucu gerektirmez.
 * Web'de sessizce no-op.
 */
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { CalculationMethodKey } from "@/features/prayer-times/engine";
import type { StoredLocation } from "@/stores/locationStore";
import type { NotificationSettings } from "@/stores/notificationSettings";

import { buildNotificationPlan } from "./plan";

const CHANNEL_ID = "prayer-times";
let setupDone = false;

/** Ön plan davranışı + Android kanalı. Uygulama başına bir kez. */
export async function ensureNotificationSetup(): Promise<void> {
  if (setupDone || Platform.OS === "web") return;
  setupDone = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Namaz Vakitleri",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelPrayerNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Önümüzdeki günlerin bildirimlerini baştan kurar (sil + yeniden zamanla).
 * Konum/ayar değişikliklerini yakalamak için idempotent tasarlandı.
 * Kurulan bildirim sayısını döner.
 */
export async function rebuildPrayerNotifications(
  location: StoredLocation,
  settings: NotificationSettings,
  method?: CalculationMethodKey,
): Promise<number> {
  if (Platform.OS === "web") return 0;

  await ensureNotificationSetup();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const plan = buildNotificationPlan(location, settings, { method });
  for (const item of plan) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: item.title,
        body: item.body,
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: item.fireDate,
        channelId: CHANNEL_ID,
      },
    });
  }
  return plan.length;
}
