import { useEffect } from "react";
import { AppState, Platform } from "react-native";

import { useLocationStore } from "@/stores/locationStore";
import { useNotificationSettings } from "@/stores/notificationSettings";
import { usePrayerSettings } from "@/stores/prayerSettings";

import {
  cancelPrayerNotifications,
  rebuildPrayerNotifications,
} from "./scheduler";

/**
 * Bildirim penceresini güncel tutar:
 * - konum veya ayar değişince (debounce'lu) yeniden kurar,
 * - uygulama öne gelince 7 günlük pencereyi tazeler.
 * Kök layout'ta bir kez çağrılır.
 */
export function useNotificationSync(): void {
  const location = useLocationStore((s) => s.location);
  const method = usePrayerSettings((s) => s.method);
  const masterEnabled = useNotificationSettings((s) => s.masterEnabled);
  const prayers = useNotificationSettings((s) => s.prayers);
  const preReminderMinutes = useNotificationSettings(
    (s) => s.preReminderMinutes,
  );

  useEffect(() => {
    if (Platform.OS === "web") return;

    const settings = { masterEnabled, prayers, preReminderMinutes };

    const rebuild = () => {
      if (!settings.masterEnabled) {
        cancelPrayerNotifications().catch(() => {});
        return;
      }
      rebuildPrayerNotifications(location, settings, method).catch((error) => {
        console.warn("Bildirimler kurulamadı:", error);
      });
    };

    // Ardışık ayar değişikliklerinde tek kurulum yapmak için debounce.
    const timer = setTimeout(rebuild, 800);

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && settings.masterEnabled) rebuild();
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [location, method, masterEnabled, prayers, preReminderMinutes]);
}
