import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Kur'an okuma ilerlemesi — KF-3 (hatim + streak) çekirdeği.
 * user.db `quran_progress` şemasıyla uyumlu; Phase 2'de Supabase senkronuna bağlanır.
 * Tasarım ilkesi (PRD KF-3): gösterişsiz, kişisel süreklilik — lig/rekabet yok.
 */

export interface LastRead {
  surahId: number;
  ayah: number;
  page: number;
  updatedAt: number;
}

interface QuranProgressState {
  lastRead: LastRead | null;
  /** Okuma yapılan günler: "YYYY-MM-DD" → o gün ulaşılan son sayfa. */
  readDays: Record<string, number>;
  markRead: (surahId: number, ayah: number, page: number) => void;
  /** Bugün dahil geriye doğru kesintisiz okuma günü sayısı (dün biterse zincir sürer). */
  streak: () => number;
  readToday: () => boolean;
  /** Senkron pull birleştirmesi: gün bazında en ileri sayfa, lastRead LWW. */
  applyRemote: (
    date: string,
    page: number,
    remoteLastRead: LastRead | null,
  ) => void;
}

function dayKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Saf türetimler — bileşenler bunları readDays'e abone olarak kullanır
 * (store içi fonksiyon selector'ı referansı değişmediği için re-render tetiklemez).
 */
export function computeStreak(readDays: Record<string, number>): number {
  let count = 0;
  const cursor = new Date();
  // Bugün okunmadıysa zincir dünden itibaren sayılır (gün henüz bitmedi).
  if (!readDays[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  while (readDays[dayKey(cursor)]) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function isReadToday(readDays: Record<string, number>): boolean {
  return Boolean(readDays[dayKey(new Date())]);
}

export const useQuranProgress = create<QuranProgressState>()(
  persist(
    (set, get) => ({
      lastRead: null,
      readDays: {},

      markRead: (surahId, ayah, page) =>
        set((state) => ({
          lastRead: { surahId, ayah, page, updatedAt: Date.now() },
          readDays: { ...state.readDays, [dayKey(new Date())]: page },
        })),

      streak: () => computeStreak(get().readDays),

      readToday: () => isReadToday(get().readDays),

      applyRemote: (date, page, remoteLastRead) =>
        set((state) => {
          const localPage = state.readDays[date] ?? 0;
          const readDays =
            page > localPage
              ? { ...state.readDays, [date]: page }
              : state.readDays;
          const lastRead =
            remoteLastRead &&
            (!state.lastRead ||
              remoteLastRead.updatedAt > state.lastRead.updatedAt)
              ? remoteLastRead
              : state.lastRead;
          return { readDays, lastRead };
        }),
    }),
    {
      name: "duahub.quran-progress",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Hatim yüzdesi — Kur'an 604 sayfadır (Medine mushafı). */
export function khatmPercent(lastRead: LastRead | null): number {
  if (!lastRead) return 0;
  return Math.min(100, Math.round((lastRead.page / 604) * 100));
}
