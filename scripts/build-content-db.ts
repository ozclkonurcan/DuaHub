/**
 * content.db üretim hattı — Kur'an metni + meal.
 *
 * Kaynaklar (fawazahmed0/quran-api, jsDelivr CDN):
 *   - Arapça: ara-quransimple (İmlâî hat — sistem fontlarıyla doğru görünür)
 *   - Meal:   tur-elmalilihamdiya (Elmalılı Hamdi Yazır, kamu malı — ticari kullanım güvenli)
 *   - Meta:   info.json (sure adları, iniş yeri, cüz/sayfa haritası)
 *
 * Çıktılar:
 *   - assets/db/quran.db            (surahs + ayahs + meta tabloları; app ile gemide gelir)
 *   - src/features/quran/surahs.json (hafif sure listesi — web dahil her yerde çalışır)
 *
 * Çalıştırma: npx tsx scripts/build-content-db.ts
 */
import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1";
const CACHE_DIR = join(__dirname, ".cache");
const OUT_DB = join(__dirname, "..", "assets", "db", "quran.db");
const OUT_META = join(__dirname, "..", "src", "features", "quran", "surahs.json");

/** Diyanet kullanımına uygun standart Türkçe sure adları (1-114). */
const TR_NAMES = [
  "Fâtiha", "Bakara", "Âl-i İmrân", "Nisâ", "Mâide", "En'âm", "A'râf",
  "Enfâl", "Tevbe", "Yûnus", "Hûd", "Yûsuf", "Ra'd", "İbrâhîm", "Hicr",
  "Nahl", "İsrâ", "Kehf", "Meryem", "Tâhâ", "Enbiyâ", "Hac", "Mü'minûn",
  "Nûr", "Furkân", "Şuarâ", "Neml", "Kasas", "Ankebût", "Rûm", "Lokmân",
  "Secde", "Ahzâb", "Sebe'", "Fâtır", "Yâsîn", "Sâffât", "Sâd", "Zümer",
  "Mü'min", "Fussilet", "Şûrâ", "Zuhruf", "Duhân", "Câsiye", "Ahkâf",
  "Muhammed", "Fetih", "Hucurât", "Kâf", "Zâriyât", "Tûr", "Necm", "Kamer",
  "Rahmân", "Vâkıa", "Hadîd", "Mücâdele", "Haşr", "Mümtehine", "Saff",
  "Cum'a", "Münâfikûn", "Teğâbün", "Talâk", "Tahrîm", "Mülk", "Kalem",
  "Hâkka", "Meâric", "Nûh", "Cin", "Müzzemmil", "Müddessir", "Kıyâme",
  "İnsân", "Mürselât", "Nebe'", "Nâziât", "Abese", "Tekvîr", "İnfitâr",
  "Mutaffifîn", "İnşikâk", "Bürûc", "Târık", "A'lâ", "Ğâşiye", "Fecr",
  "Beled", "Şems", "Leyl", "Duhâ", "İnşirâh", "Tîn", "Alak", "Kadir",
  "Beyyine", "Zilzâl", "Âdiyât", "Kâria", "Tekâsür", "Asr", "Hümeze",
  "Fîl", "Kureyş", "Mâûn", "Kevser", "Kâfirûn", "Nasr", "Tebbet", "İhlâs",
  "Felak", "Nâs",
];

interface EditionVerse {
  chapter: number;
  verse: number;
  text: string;
}
interface ChapterInfo {
  chapter: number;
  name: string;
  arabicname: string;
  revelation: string;
  verses: { verse: number; juz: number; page: number }[];
}

async function fetchCached(name: string): Promise<unknown> {
  const cachePath = join(CACHE_DIR, name.replaceAll("/", "_"));
  if (existsSync(cachePath)) {
    return JSON.parse(readFileSync(cachePath, "utf8"));
  }
  const url = `${CDN}/${name}`;
  console.log("indiriliyor:", url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`İndirme başarısız (${res.status}): ${url}`);
  const text = await res.text();
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(cachePath, text);
  return JSON.parse(text);
}

async function main() {
  const [arabic, turkish, info] = (await Promise.all([
    fetchCached("editions/ara-quransimple.json"),
    fetchCached("editions/tur-elmalilihamdiya.json"),
    fetchCached("info.json"),
  ])) as [
    { quran: EditionVerse[] },
    { quran: EditionVerse[] },
    { chapters: ChapterInfo[] },
  ];

  if (arabic.quran.length !== turkish.quran.length) {
    throw new Error(
      `Ayet sayıları uyuşmuyor: ar=${arabic.quran.length} tr=${turkish.quran.length}`,
    );
  }

  // Meal metnini (sure:ayet) → metin haritasına çevir.
  const trMap = new Map<string, string>();
  for (const v of turkish.quran) trMap.set(`${v.chapter}:${v.verse}`, v.text);

  mkdirSync(join(__dirname, "..", "assets", "db"), { recursive: true });
  const db = new Database(OUT_DB);
  db.pragma("journal_mode = OFF");
  db.exec(`
    DROP TABLE IF EXISTS surahs;
    DROP TABLE IF EXISTS ayahs;
    DROP TABLE IF EXISTS meta;
    CREATE TABLE surahs (
      id INTEGER PRIMARY KEY,
      name_tr TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      translit TEXT NOT NULL,
      revelation TEXT NOT NULL CHECK (revelation IN ('mekki','medeni')),
      ayah_count INTEGER NOT NULL,
      start_page INTEGER NOT NULL,
      start_juz INTEGER NOT NULL
    );
    CREATE TABLE ayahs (
      surah_id INTEGER NOT NULL REFERENCES surahs(id),
      number INTEGER NOT NULL,
      text_ar TEXT NOT NULL,
      text_tr TEXT NOT NULL,
      juz INTEGER NOT NULL,
      page INTEGER NOT NULL,
      PRIMARY KEY (surah_id, number)
    );
    CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `);

  const insertSurah = db.prepare(
    "INSERT INTO surahs VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const insertAyah = db.prepare("INSERT INTO ayahs VALUES (?, ?, ?, ?, ?, ?)");

  const surahsMeta: object[] = [];

  db.transaction(() => {
    for (const ch of info.chapters) {
      const nameTr = TR_NAMES[ch.chapter - 1];
      const revelation = ch.revelation === "Mecca" ? "mekki" : "medeni";
      insertSurah.run(
        ch.chapter,
        nameTr,
        ch.arabicname,
        ch.name,
        revelation,
        ch.verses.length,
        ch.verses[0].page,
        ch.verses[0].juz,
      );
      surahsMeta.push({
        id: ch.chapter,
        nameTr,
        nameAr: ch.arabicname,
        translit: ch.name,
        revelation,
        ayahCount: ch.verses.length,
      });
    }

    const verseInfo = new Map<string, { juz: number; page: number }>();
    for (const ch of info.chapters) {
      for (const v of ch.verses) {
        verseInfo.set(`${ch.chapter}:${v.verse}`, { juz: v.juz, page: v.page });
      }
    }

    for (const v of arabic.quran) {
      const key = `${v.chapter}:${v.verse}`;
      const tr = trMap.get(key);
      const vi = verseInfo.get(key);
      if (!tr || !vi) throw new Error(`Eksik veri: ${key}`);
      insertAyah.run(v.chapter, v.verse, v.text, tr, vi.juz, vi.page);
    }

    db.prepare("INSERT INTO meta VALUES (?, ?)").run("version", "1");
    db.prepare("INSERT INTO meta VALUES (?, ?)").run(
      "attribution",
      "Arapça metin: quran-api/ara-quransimple · Meal: Elmalılı Hamdi Yazır (kamu malı)",
    );
  })();

  // Doğrulama
  const surahCount = (db.prepare("SELECT COUNT(*) c FROM surahs").get() as { c: number }).c;
  const ayahCount = (db.prepare("SELECT COUNT(*) c FROM ayahs").get() as { c: number }).c;
  const fatiha = (db.prepare("SELECT COUNT(*) c FROM ayahs WHERE surah_id=1").get() as { c: number }).c;
  const ilkAyet = db
    .prepare("SELECT text_ar, text_tr FROM ayahs WHERE surah_id=1 AND number=1")
    .get() as { text_ar: string; text_tr: string };
  db.close();

  writeFileSync(OUT_META, JSON.stringify(surahsMeta, null, 1) + "\n");

  console.log(`✔ surahs: ${surahCount} (beklenen 114)`);
  console.log(`✔ ayahs: ${ayahCount} (beklenen 6236)`);
  console.log(`✔ Fâtiha ayet sayısı: ${fatiha} (beklenen 7)`);
  console.log(`✔ 1:1 → ${ilkAyet.text_ar} | ${ilkAyet.text_tr.slice(0, 60)}`);
  if (surahCount !== 114 || ayahCount !== 6236 || fatiha !== 7) {
    throw new Error("Doğrulama başarısız!");
  }
  console.log(`✔ Yazıldı: ${OUT_DB}`);
  console.log(`✔ Yazıldı: ${OUT_META}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
