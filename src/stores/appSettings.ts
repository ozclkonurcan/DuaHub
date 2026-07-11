import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AppSettingsState {
  hasOnboarded: boolean;
  setHasOnboarded: (value: boolean) => void;
}

export const useAppSettings = create<AppSettingsState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      setHasOnboarded: (hasOnboarded) => set({ hasOnboarded }),
    }),
    {
      name: "duahub.app-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/**
 * Persist hidrasyonu tamamlanana dek true dönmez — onboarding guard'ının
 * ilk karede yanlış yönlendirme yapmasını engeller.
 */
export function useAppSettingsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    useAppSettings.persist.hasHydrated(),
  );

  useEffect(() => {
    const unsub = useAppSettings.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

  return hydrated;
}
