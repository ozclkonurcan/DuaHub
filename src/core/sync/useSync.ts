import { useEffect, useRef } from "react";
import { AppState } from "react-native";

import { useSession } from "@/features/auth/useAuth";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useQuranProgress } from "@/stores/quranProgress";
import { useSyncMeta } from "@/stores/syncMeta";

import { syncNow } from "./engine";

const MUTATION_DEBOUNCE_MS = 4000;

/**
 * Senkron tetikleyicileri (kök layout'ta bir kez çağrılır):
 * - girişte tam eşitleme,
 * - uygulama öne gelince,
 * - favori/ilerleme değişince (debounce'lu),
 * - çıkışta senkron defterini sıfırla.
 */
export function useSync(): void {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const prevUserId = useRef<string | null>(null);

  useEffect(() => {
    // Çıkış veya hesap değişimi: filigran ve id eşlemeleri bu hesaba aitti.
    if (prevUserId.current && prevUserId.current !== userId) {
      useSyncMeta.getState().reset();
    }
    prevUserId.current = userId;
    if (!userId) return;

    const run = () => {
      syncNow(userId).catch((error) =>
        console.warn("Senkron başarısız:", error?.message ?? error),
      );
    };

    run(); // girişte

    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") run();
    });

    let timer: ReturnType<typeof setTimeout> | null = null;
    const debouncedRun = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, MUTATION_DEBOUNCE_MS);
    };
    const unsubFavorites = useFavoritesStore.subscribe(debouncedRun);
    const unsubProgress = useQuranProgress.subscribe(debouncedRun);

    return () => {
      appState.remove();
      unsubFavorites();
      unsubProgress();
      if (timer) clearTimeout(timer);
    };
  }, [userId]);
}
