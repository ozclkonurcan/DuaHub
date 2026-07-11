/**
 * Gemide gelen salt okunur içerik veritabanı (quran.db) erişimi.
 * İlk açılışta asset'ten belge dizinine kopyalanır, sonra expo-sqlite ile açılır.
 * DB sürümü değişince dosya adı da değişir (quran-v2.db) — eski dosya kalır, yenisi kopyalanır.
 * Web'de SQLite yok: null döner, çağıran taraf zarif geri düşüş gösterir.
 */
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

const DB_FILENAME = "quran-v1.db";

let dbPromise: Promise<SQLite.SQLiteDatabase | null> | null = null;

async function open(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === "web") return null;

  const sqliteDir = `${FileSystem.documentDirectory}SQLite`;
  const dbPath = `${sqliteDir}/${DB_FILENAME}`;

  const info = await FileSystem.getInfoAsync(dbPath);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true }).catch(
      () => {},
    );
    const asset = Asset.fromModule(require("../../../assets/db/quran.db"));
    await asset.downloadAsync();
    if (!asset.localUri) throw new Error("quran.db asset'i çözülemedi");
    await FileSystem.copyAsync({ from: asset.localUri, to: dbPath });
  }

  return SQLite.openDatabaseAsync(DB_FILENAME);
}

export function getContentDb(): Promise<SQLite.SQLiteDatabase | null> {
  dbPromise ??= open().catch((error) => {
    dbPromise = null; // sonraki denemede yeniden kopyalamayı dene
    throw error;
  });
  return dbPromise;
}
