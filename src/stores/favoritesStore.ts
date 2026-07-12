import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Favoriler — user.db `favorites` tablosuyla uyumlu.
 * Senkron için tombstone tutar: favoriden çıkarma silme değil,
 * favorited=false + updatedAt işaretlemesidir (LWW birleştirme bunu ister).
 */
type ContentType = "dua" | "ayah";

export interface FavoriteEntry {
  favorited: boolean;
  /** ms epoch — LWW karşılaştırması ve push filtresi için. */
  updatedAt: number;
}

interface FavoritesState {
  entries: Record<string, FavoriteEntry>;
  toggle: (type: ContentType, id: string) => void;
  isFavorite: (type: ContentType, id: string) => boolean;
  count: (type: ContentType) => number;
  /** Senkron pull birleştirmesi — sunucudan gelen durumu LWW ile uygular. */
  applyRemote: (key: string, favorited: boolean, updatedAt: number) => void;
}

const keyOf = (type: ContentType, id: string) => `${type}:${id}`;

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      entries: {},

      toggle: (type, id) =>
        set((state) => {
          const key = keyOf(type, id);
          const current = state.entries[key];
          return {
            entries: {
              ...state.entries,
              [key]: {
                favorited: !(current?.favorited ?? false),
                updatedAt: Date.now(),
              },
            },
          };
        }),

      isFavorite: (type, id) =>
        get().entries[keyOf(type, id)]?.favorited ?? false,

      count: (type) =>
        Object.entries(get().entries).filter(
          ([k, e]) => k.startsWith(`${type}:`) && e.favorited,
        ).length,

      applyRemote: (key, favorited, updatedAt) =>
        set((state) => {
          const local = state.entries[key];
          if (local && local.updatedAt >= updatedAt) return state; // yerel daha yeni
          return {
            entries: { ...state.entries, [key]: { favorited, updatedAt } },
          };
        }),
    }),
    {
      name: "duahub.favorites",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted, version) => {
        // v0: { keys: Record<"dua:1", true> } → v1: entries + tombstone yapısı
        if (version === 0 && persisted && typeof persisted === "object") {
          const old = persisted as { keys?: Record<string, true> };
          const entries: Record<string, FavoriteEntry> = {};
          for (const key of Object.keys(old.keys ?? {})) {
            entries[key] = { favorited: true, updatedAt: Date.now() };
          }
          return { entries };
        }
        return persisted as { entries: Record<string, FavoriteEntry> };
      },
    },
  ),
);
