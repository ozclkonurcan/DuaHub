/**
 * user.db şeması (Drizzle) — kullanıcının senkronlanan verisi.
 * Tüm tablolar offline-first senkron sözleşmesini taşır:
 * updatedAt (LWW karşılaştırması) + deletedAt (soft delete).
 * Zikir gibi sayaç veriler delta birleştirme ile senkronlanır (bkz. PRD §4.3).
 * Phase 1'de expo-sqlite'a bağlanacak; şimdilik yalnızca şema tanımı.
 */
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const syncColumns = {
  id: text("id").primaryKey(), // uuid
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
};

/** Kılınan namazların günlüğü (İbadet Günlüğü / streak kaynağı). */
export const prayerLog = sqliteTable("prayer_log", {
  ...syncColumns,
  date: text("date").notNull(), // YYYY-MM-DD (yerel)
  prayer: text("prayer", {
    enum: ["fajr", "dhuhr", "asr", "maghrib", "isha"],
  }).notNull(),
  status: text("status", { enum: ["on_time", "late", "missed"] }).notNull(),
});

/** Zikir oturumları — toplamsal senkron (delta) için oturum bazlı kayıt. */
export const dhikrSessions = sqliteTable("dhikr_sessions", {
  ...syncColumns,
  dhikrKey: text("dhikr_key").notNull(), // ör. "subhanallah", "custom:<uuid>"
  count: integer("count").notNull(),
  target: integer("target"),
  startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
});

/** Dua favorileri (content.db'deki dua id'lerine referans). */
export const favorites = sqliteTable("favorites", {
  ...syncColumns,
  contentType: text("content_type", { enum: ["dua", "ayah"] }).notNull(),
  contentId: text("content_id").notNull(),
});

/** Kur'an okuma ilerlemesi (hatim + streak kaynağı). */
export const quranProgress = sqliteTable("quran_progress", {
  ...syncColumns,
  date: text("date").notNull(), // YYYY-MM-DD
  fromPage: integer("from_page").notNull(),
  toPage: integer("to_page").notNull(),
});

/** Senkron kuyruğu — Supabase'e gönderilmeyi bekleyen mutasyonlar. */
export const syncQueue = sqliteTable("sync_queue", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tableName: text("table_name").notNull(),
  rowId: text("row_id").notNull(),
  op: text("op", { enum: ["upsert", "delete"] }).notNull(),
  queuedAt: integer("queued_at", { mode: "timestamp_ms" }).notNull(),
});
