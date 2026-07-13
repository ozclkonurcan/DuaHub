const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Gemide gelen SQLite içerik veritabanı (assets/db/quran.db) asset olarak paketlenir.
config.resolver.assetExts.push("db");

// @supabase/supabase-js (isows/ws üzerinden) Metro'nun "package exports" çözümlemesiyle
// Node'a özgü, Hermes'in desteklemediği private class field söz dizimine sahip koda
// yönleniyor ("private properties are not supported" hatası). Resmi geçici çözüm: kapat.
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: "./global.css" });
