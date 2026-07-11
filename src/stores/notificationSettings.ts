import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { PrayerName } from "@/features/prayer-times/engine";

export type PreReminderMinutes = 0 | 15 | 30 | 45;

export interface NotificationSettings {
  /** Kapalıysa hiçbir vakit bildirimi kurulmaz. */
  masterEnabled: boolean;
  prayers: Record<PrayerName, boolean>;
  /** 0 = vakit öncesi hatırlatma kapalı. */
  preReminderMinutes: PreReminderMinutes;
}

interface NotificationSettingsState extends NotificationSettings {
  setMasterEnabled: (value: boolean) => void;
  togglePrayer: (prayer: PrayerName) => void;
  setPreReminderMinutes: (minutes: PreReminderMinutes) => void;
}

export const useNotificationSettings = create<NotificationSettingsState>()(
  persist(
    (set) => ({
      masterEnabled: false,
      prayers: {
        fajr: true,
        sunrise: false,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true,
      },
      preReminderMinutes: 0,
      setMasterEnabled: (masterEnabled) => set({ masterEnabled }),
      togglePrayer: (prayer) =>
        set((state) => ({
          prayers: { ...state.prayers, [prayer]: !state.prayers[prayer] },
        })),
      setPreReminderMinutes: (preReminderMinutes) =>
        set({ preReminderMinutes }),
    }),
    {
      name: "duahub.notification-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
