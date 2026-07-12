import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Senkron defteri: pull filigranı + yerel anahtar → sunucu satır id eşlemeleri.
 * id eşlemeleri, upsert'lerin hep aynı satıra yazmasını sağlar (PK çalkantısı olmaz).
 */
interface SyncMetaState {
  /** Son başarılı pull'un sunucu zamanı (ISO) — bir sonraki pull bundan sonrasını çeker. */
  lastPulledAt: string | null;
  lastSyncAt: number | null;
  /** "dua:1" → favorites.id (uuid) */
  favoriteIds: Record<string, string>;
  /** "YYYY-MM-DD" → quran_progress.id (uuid) */
  progressIds: Record<string, string>;
  setPulled: (iso: string) => void;
  rememberFavoriteId: (key: string, id: string) => void;
  rememberProgressId: (date: string, id: string) => void;
  markSynced: () => void;
  /** Çıkışta sıfırla — başka hesapla karışmasın. */
  reset: () => void;
}

export const useSyncMeta = create<SyncMetaState>()(
  persist(
    (set) => ({
      lastPulledAt: null,
      lastSyncAt: null,
      favoriteIds: {},
      progressIds: {},
      setPulled: (lastPulledAt) => set({ lastPulledAt }),
      rememberFavoriteId: (key, id) =>
        set((s) => ({ favoriteIds: { ...s.favoriteIds, [key]: id } })),
      rememberProgressId: (date, id) =>
        set((s) => ({ progressIds: { ...s.progressIds, [date]: id } })),
      markSynced: () => set({ lastSyncAt: Date.now() }),
      reset: () =>
        set({
          lastPulledAt: null,
          lastSyncAt: null,
          favoriteIds: {},
          progressIds: {},
        }),
    }),
    {
      name: "duahub.sync-meta",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
