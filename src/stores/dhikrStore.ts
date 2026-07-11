import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DHIKR_PRESETS, getPreset } from "@/features/dhikr/presets";

function todayKey(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface DhikrState {
  /** Aktif zikir (preset anahtarı). */
  dhikrKey: string;
  target: number;
  /** Mevcut set içindeki sayım (0..target-1 arası döner). */
  count: number;
  /** Bu oturumda tamamlanan set sayısı. */
  completedSets: number;
  /** Günlük toplamlar: "YYYY-MM-DD|dhikrKey" → toplam çekim. */
  totals: Record<string, number>;

  /** Bir çekim. Set tamamlandıysa true döner (haptic/animasyon tetiklemek için). */
  tap: () => boolean;
  reset: () => void;
  selectDhikr: (key: string) => void;
  setTarget: (target: number) => void;
  todayTotal: (key: string) => number;
}

export const useDhikrStore = create<DhikrState>()(
  persist(
    (set, get) => ({
      dhikrKey: DHIKR_PRESETS[0].key,
      target: DHIKR_PRESETS[0].defaultTarget,
      count: 0,
      completedSets: 0,
      totals: {},

      tap: () => {
        const { count, target, dhikrKey, completedSets, totals } = get();
        const next = count + 1;
        const totalKey = `${todayKey()}|${dhikrKey}`;
        const newTotals = { ...totals, [totalKey]: (totals[totalKey] ?? 0) + 1 };
        const setDone = next >= target;
        set({
          count: setDone ? 0 : next,
          completedSets: setDone ? completedSets + 1 : completedSets,
          totals: newTotals,
        });
        return setDone;
      },

      reset: () => set({ count: 0, completedSets: 0 }),

      selectDhikr: (key) =>
        set({
          dhikrKey: key,
          target: getPreset(key).defaultTarget,
          count: 0,
          completedSets: 0,
        }),

      setTarget: (target) => set({ target, count: 0, completedSets: 0 }),

      todayTotal: (key) => get().totals[`${todayKey()}|${key}`] ?? 0,
    }),
    {
      name: "duahub.dhikr",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
