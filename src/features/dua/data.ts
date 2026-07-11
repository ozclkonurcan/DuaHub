/**
 * Dua kütüphanesi veri katmanı.
 * Kaynak şimdilik gemideki duas.json; Phase 2'de content.db'ye (SQLite) taşınacak —
 * bu modülün arayüzü o geçişte değişmeyecek şekilde tasarlandı.
 */
import type { Ionicons } from "@expo/vector-icons";

import { trIncludes } from "@/core/utils/turkishSearch";

import duasJson from "../../../data/duas.json";

export interface Dua {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  category: string;
  benefit: string;
  source: string;
  isPremium: boolean;
  tags: string[];
}

export interface DuaCategory {
  slug: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Kart/çip vurgusu — iki temada da okunur, doygun ara tonlar. */
  color: string;
}

export const DUA_CATEGORIES: DuaCategory[] = [
  { slug: "sabah-aksam", name: "Sabah-Akşam", icon: "sunny-outline", color: "#F59E0B" },
  { slug: "namaz", name: "Namaz", icon: "moon-outline", color: "#3B82F6" },
  { slug: "gunluk", name: "Günlük Hayat", icon: "home-outline", color: "#14B8A6" },
  { slug: "koruma", name: "Korunma", icon: "shield-checkmark-outline", color: "#8B5CF6" },
  { slug: "sikinti-dert", name: "Sıkıntı-Dert", icon: "heart-outline", color: "#EF4444" },
  { slug: "sifa", name: "Şifa", icon: "pulse-outline", color: "#10B981" },
  { slug: "rizik-bereket", name: "Rızık-Bereket", icon: "leaf-outline", color: "#22C55E" },
  { slug: "yolculuk", name: "Yolculuk", icon: "airplane-outline", color: "#06B6D4" },
  { slug: "uyku", name: "Uyku", icon: "bed-outline", color: "#6366F1" },
  { slug: "sukur", name: "Şükür", icon: "rose-outline", color: "#EC4899" },
  { slug: "evlilik-aile", name: "Aile", icon: "people-outline", color: "#F97316" },
];

export const ALL_DUAS: Dua[] = duasJson.duas;

export function getDuaById(id: string): Dua | undefined {
  return ALL_DUAS.find((d) => d.id === id);
}

export function getCategory(slug: string): DuaCategory | undefined {
  return DUA_CATEGORIES.find((c) => c.slug === slug);
}

/** Türkçe-duyarlı arama: başlık, anlam ve etiketlerde geçen ifadeyi bulur. */
export function searchDuas(
  duas: Dua[],
  query: string,
  categorySlug: string | null,
): Dua[] {
  let result = duas;
  if (categorySlug) {
    result = result.filter((d) => d.category === categorySlug);
  }
  const q = query.trim();
  if (q.length > 0) {
    result = result.filter((d) =>
      trIncludes(
        [d.title, d.meaning, d.transliteration, ...d.tags].join(" "),
        q,
      ),
    );
  }
  return result;
}
