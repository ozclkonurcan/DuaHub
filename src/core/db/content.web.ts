/**
 * content.ts'in web karşılığı — Metro web bundle'ında bu dosya çözülür,
 * böylece expo-sqlite (ve wa-sqlite.wasm) web paketine hiç girmez.
 * İçerik veritabanı yalnızca native'de mevcuttur; web null döner ve
 * ekranlar zarif geri düşüş gösterir.
 */
import type { SQLiteDatabase } from "expo-sqlite";

export function getContentDb(): Promise<SQLiteDatabase | null> {
  return Promise.resolve(null);
}
