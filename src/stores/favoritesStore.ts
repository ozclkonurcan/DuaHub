import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Favoriler — user.db `favorites` tablosuyla uyumlu anahtar yapısı
 * ("contentType:contentId"); Phase 2'de Supabase senkronuna bağlanacak.
 */
type ContentType = "dua" | "ayah";

interface FavoritesState {
  keys: Record<string, true>;
  toggle: (type: ContentType, id: string) => void;
  isFavorite: (type: ContentType, id: string) => boolean;
  count: (type: ContentType) => number;
}

const keyOf = (type: ContentType, id: string) => `${type}:${id}`;

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      keys: {},
      toggle: (type, id) =>
        set((state) => {
          const key = keyOf(type, id);
          const keys = { ...state.keys };
          if (keys[key]) delete keys[key];
          else keys[key] = true;
          return { keys };
        }),
      isFavorite: (type, id) => Boolean(get().keys[keyOf(type, id)]),
      count: (type) =>
        Object.keys(get().keys).filter((k) => k.startsWith(`${type}:`)).length,
    }),
    {
      name: "duahub.favorites",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
