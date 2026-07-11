import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  DEFAULT_METHOD,
  type CalculationMethodKey,
} from "@/features/prayer-times/engine";

interface PrayerSettingsState {
  method: CalculationMethodKey;
  setMethod: (method: CalculationMethodKey) => void;
}

export const usePrayerSettings = create<PrayerSettingsState>()(
  persist(
    (set) => ({
      method: DEFAULT_METHOD,
      setMethod: (method) => set({ method }),
    }),
    {
      name: "duahub.prayer-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
