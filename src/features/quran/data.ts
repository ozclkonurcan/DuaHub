/**
 * Kur'an veri katmanı.
 * Sure listesi hafif JSON'dan gelir (web dahil senkron çalışır);
 * ayet metinleri gemideki quran.db'den okunur (yalnızca native).
 */
import { getContentDb } from "@/core/db/content";
import { trIncludes } from "@/core/utils/turkishSearch";

import surahsJson from "./surahs.json";

export interface SurahMeta {
  id: number;
  nameTr: string;
  nameAr: string;
  translit: string;
  revelation: "mekki" | "medeni";
  ayahCount: number;
}

export interface Ayah {
  surahId: number;
  number: number;
  textAr: string;
  textTr: string;
  juz: number;
  page: number;
}

export const SURAHS: SurahMeta[] = surahsJson as SurahMeta[];

export function getSurah(id: number): SurahMeta | undefined {
  return SURAHS.find((s) => s.id === id);
}

export function searchSurahs(query: string): SurahMeta[] {
  const q = query.trim();
  if (!q) return SURAHS;
  return SURAHS.filter(
    (s) =>
      trIncludes(s.nameTr, q) ||
      trIncludes(s.translit, q) ||
      String(s.id) === q,
  );
}

/** Bir surenin tüm ayetleri. Web'de (SQLite yok) null döner. */
export async function getAyahs(surahId: number): Promise<Ayah[] | null> {
  const db = await getContentDb();
  if (!db) return null;
  const rows = await db.getAllAsync<{
    surah_id: number;
    number: number;
    text_ar: string;
    text_tr: string;
    juz: number;
    page: number;
  }>(
    "SELECT surah_id, number, text_ar, text_tr, juz, page FROM ayahs WHERE surah_id = ? ORDER BY number",
    [surahId],
  );
  return rows.map((r) => ({
    surahId: r.surah_id,
    number: r.number,
    textAr: r.text_ar,
    textTr: r.text_tr,
    juz: r.juz,
    page: r.page,
  }));
}
