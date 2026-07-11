const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Gemide gelen SQLite içerik veritabanı (assets/db/quran.db) asset olarak paketlenir.
config.resolver.assetExts.push("db");

module.exports = withNativeWind(config, { input: "./global.css" });
