import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { PrayerName } from "@/features/prayer-times/engine";

/**
 * İbadet Günlüğü — kılınan namazların kaydı (KF-4 kaynağı).
 * Sunucudaki prayer_log tablosuyla uyumlu; tombstone = status null + updatedAt.
 * v1 UX: dokun → kılındı (on_time), tekrar dokun → işareti kaldır.
 * "late/missed" ayrımı haftalık içgörü ekranıyla birlikte gelecek.
 */
export type PrayerStatus = "on_time" | "late" | "missed";
export type LoggablePrayer = Exclude<PrayerName, "sunrise">;

export interface PrayerLogEntry {
  /** null = işaret kaldırıldı (tombstone). */
  status: PrayerStatus | null;
  updatedAt: number;
}

interface PrayerLogState {
  /** "YYYY-MM-DD|fajr" → kayıt */
  entries: Record<string, PrayerLogEntry>;
  toggle: (date: string, prayer: LoggablePrayer) => void;
  statusOf: (date: string, prayer: LoggablePrayer) => PrayerStatus | null;
  applyRemote: (
    key: string,
    status: PrayerStatus | null,
    updatedAt: number,
  ) => void;
}

export const keyOf = (date: string, prayer: LoggablePrayer) =>
  `${date}|${prayer}`;

export function todayKey(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const usePrayerLog = create<PrayerLogState>()(
  persist(
    (set, get) => ({
      entries: {},

      toggle: (date, prayer) =>
        set((state) => {
          const key = keyOf(date, prayer);
          const current = state.entries[key];
          return {
            entries: {
              ...state.entries,
              [key]: {
                status: current?.status ? null : "on_time",
                updatedAt: Date.now(),
              },
            },
          };
        }),

      statusOf: (date, prayer) =>
        get().entries[keyOf(date, prayer)]?.status ?? null,

      applyRemote: (key, status, updatedAt) =>
        set((state) => {
          const local = state.entries[key];
          if (local && local.updatedAt >= updatedAt) return state;
          return {
            entries: { ...state.entries, [key]: { status, updatedAt } },
          };
        }),
    }),
    {
      name: "duahub.prayer-log",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
