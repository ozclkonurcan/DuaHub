const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Gemide gelen SQLite içerik veritabanı (assets/db/quran.db) asset olarak paketlenir.
config.resolver.assetExts.push("db");

// Bazı bağımlılıklar (ör. @tanstack/query-core) "main"/"module" alanlarında
// güvenli (eski hedefli, private class field içermeyen) bir derleme sunarken,
// "exports" haritasında "import"/"require" koşullarını sadece MODERN derlemeye
// yönlendiriyor — bu paket sürümündeki Hermes'in ayrıştıramadığı native private
// class field ("#alan") söz dizimi içeriyor. Package-exports çözümlemesini
// kapatmak Metro'yu "main"/"module" alanına (güvenli derleme) düşürür.
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: "./global.css" });
