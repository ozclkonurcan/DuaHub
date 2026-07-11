import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  DEFAULT_LOCATION,
  type GeoPoint,
} from "@/features/prayer-times/engine";

export interface StoredLocation extends GeoPoint {
  label: string;
}

interface LocationState {
  location: StoredLocation;
  /** "default": henüz GPS alınmadı, İstanbul varsayılanı kullanılıyor. */
  source: "default" | "gps";
  updatedAt: number | null;
  setGpsLocation: (location: StoredLocation) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      location: {
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
        label: DEFAULT_LOCATION.label,
      },
      source: "default",
      updatedAt: null,
      setGpsLocation: (location) =>
        set({ location, source: "gps", updatedAt: Date.now() }),
    }),
    {
      name: "duahub.location",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
