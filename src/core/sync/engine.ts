/**
 * Senkron motoru v1 — favoriler + Kur'an ilerlemesi.
 *
 * Akış (her koşuda): PULL (sunucudan lastPulledAt sonrası değişenler → LWW merge)
 *                  → PUSH (yerel durumun tamamı upsert; unique kısıtlar idempotent kılar)
 *                  → filigran güncelle.
 *
 * İlkeler (PRD §4.3): yazma önce yerelde olur, sunucu yedek/eşitleme katmanıdır;
 * çakışmada updated_at yenisi kazanır (LWW). Zikir delta senkronu Phase 2 devamında.
 */
import { randomUUID } from "expo-crypto";

import { supabase } from "@/core/api/supabase";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { usePrayerLog, type PrayerStatus } from "@/stores/prayerLog";
import { useQuranProgress } from "@/stores/quranProgress";
import { useSyncMeta } from "@/stores/syncMeta";

let running = false;

export async function syncNow(userId: string): Promise<void> {
  if (!supabase || running) return;
  running = true;
  try {
    const meta = useSyncMeta.getState();
    const pulledAt = meta.lastPulledAt ?? "1970-01-01T00:00:00Z";
    // Saat kayması yaşamamak için filigranı sunucu satırlarının max updated_at'inden alırız.
    let maxSeen = meta.lastPulledAt;

    // ---------- PULL: favorites ----------
    const { data: favRows, error: favPullError } = await supabase
      .from("favorites")
      .select("id, content_type, content_id, updated_at, deleted_at")
      .gt("updated_at", pulledAt);
    if (favPullError) throw favPullError;

    const favorites = useFavoritesStore.getState();
    for (const row of favRows ?? []) {
      const key = `${row.content_type}:${row.content_id}`;
      meta.rememberFavoriteId(key, row.id);
      favorites.applyRemote(
        key,
        row.deleted_at === null,
        new Date(row.updated_at).getTime(),
      );
      if (!maxSeen || row.updated_at > maxSeen) maxSeen = row.updated_at;
    }

    // ---------- PULL: quran_progress ----------
    const { data: qpRows, error: qpPullError } = await supabase
      .from("quran_progress")
      .select("id, date, last_surah, last_ayah, last_page, updated_at, deleted_at")
      .gt("updated_at", pulledAt);
    if (qpPullError) throw qpPullError;

    const progress = useQuranProgress.getState();
    for (const row of qpRows ?? []) {
      if (row.deleted_at) continue;
      meta.rememberProgressId(row.date, row.id);
      progress.applyRemote(
        row.date,
        row.last_page ?? 0,
        row.last_surah && row.last_ayah && row.last_page
          ? {
              surahId: row.last_surah,
              ayah: row.last_ayah,
              page: row.last_page,
              updatedAt: new Date(row.updated_at).getTime(),
            }
          : null,
      );
      if (!maxSeen || row.updated_at > maxSeen) maxSeen = row.updated_at;
    }

    // ---------- PULL: prayer_log ----------
    const { data: plRows, error: plPullError } = await supabase
      .from("prayer_log")
      .select("id, date, prayer, status, updated_at, deleted_at")
      .gt("updated_at", pulledAt);
    if (plPullError) throw plPullError;

    const prayerLog = usePrayerLog.getState();
    for (const row of plRows ?? []) {
      const key = `${row.date}|${row.prayer}`;
      meta.rememberPrayerLogId(key, row.id);
      prayerLog.applyRemote(
        key,
        row.deleted_at ? null : (row.status as PrayerStatus),
        new Date(row.updated_at).getTime(),
      );
      if (!maxSeen || row.updated_at > maxSeen) maxSeen = row.updated_at;
    }

    // ---------- PUSH: favorites ----------
    const favEntries = useFavoritesStore.getState().entries;
    const favIds = useSyncMeta.getState().favoriteIds;
    const favPayload = Object.entries(favEntries).map(([key, entry]) => {
      const [contentType, contentId] = key.split(":");
      const id = favIds[key] ?? randomUUID();
      if (!favIds[key]) useSyncMeta.getState().rememberFavoriteId(key, id);
      const iso = new Date(entry.updatedAt).toISOString();
      return {
        id,
        user_id: userId,
        content_type: contentType,
        content_id: contentId,
        updated_at: iso,
        deleted_at: entry.favorited ? null : iso,
      };
    });
    if (favPayload.length > 0) {
      const { error } = await supabase
        .from("favorites")
        .upsert(favPayload, { onConflict: "user_id,content_type,content_id" });
      if (error) throw error;
    }

    // ---------- PUSH: prayer_log ----------
    const plEntries = usePrayerLog.getState().entries;
    const plIds = useSyncMeta.getState().prayerLogIds;
    const plPayload = Object.entries(plEntries).map(([key, entry]) => {
      const [date, prayer] = key.split("|");
      const id = plIds[key] ?? randomUUID();
      if (!plIds[key]) useSyncMeta.getState().rememberPrayerLogId(key, id);
      const iso = new Date(entry.updatedAt).toISOString();
      return {
        id,
        user_id: userId,
        date,
        prayer,
        // Sunucu kolonu NOT NULL: tombstone'da son bilinen/varsayılan statü +
        // deleted_at gönderilir; pull tarafı deleted_at'e bakar.
        status: entry.status ?? "on_time",
        updated_at: iso,
        deleted_at: entry.status === null ? iso : null,
      };
    });
    if (plPayload.length > 0) {
      const { error } = await supabase
        .from("prayer_log")
        .upsert(plPayload, { onConflict: "user_id,date,prayer" });
      if (error) throw error;
    }

    // ---------- PUSH: quran_progress ----------
    const { readDays, lastRead } = useQuranProgress.getState();
    const progressIds = useSyncMeta.getState().progressIds;
    const lastReadDate = lastRead
      ? new Date(lastRead.updatedAt)
      : null;
    const lastReadDayKey = lastReadDate
      ? `${lastReadDate.getFullYear()}-${String(lastReadDate.getMonth() + 1).padStart(2, "0")}-${String(lastReadDate.getDate()).padStart(2, "0")}`
      : null;

    const qpPayload = Object.entries(readDays).map(([date, page]) => {
      const id = progressIds[date] ?? randomUUID();
      if (!progressIds[date]) useSyncMeta.getState().rememberProgressId(date, id);
      const isLastReadDay = lastRead !== null && date === lastReadDayKey;
      return {
        id,
        user_id: userId,
        date,
        last_page: page,
        last_surah: isLastReadDay ? lastRead.surahId : null,
        last_ayah: isLastReadDay ? lastRead.ayah : null,
        updated_at: new Date(
          isLastReadDay ? lastRead.updatedAt : Date.now(),
        ).toISOString(),
      };
    });
    if (qpPayload.length > 0) {
      const { error } = await supabase
        .from("quran_progress")
        .upsert(qpPayload, { onConflict: "user_id,date" });
      if (error) throw error;
    }

    if (maxSeen) useSyncMeta.getState().setPulled(maxSeen);
    useSyncMeta.getState().markSynced();
  } finally {
    running = false;
  }
}
