/**
 * Türkçe dini metin araması için normalizasyon:
 * - Türkçe-duyarlı küçük harf
 * - Şapkalı/uzatmalı harfleri sadeleştir (â→a, î→i, û→u) — kullanıcı "yasin"
 *   yazınca "Yâsîn" bulunmalı
 * - Kesme/hamze işaretlerini kaldır ("Mü'minûn" → "müminun")
 */
export function normalizeTr(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .replace(/[âàá]/g, "a")
    .replace(/[îìí]/g, "i")
    .replace(/[ûùú]/g, "u")
    .replace(/[êèé]/g, "e")
    .replace(/[ôòó]/g, "o")
    .replace(/['’ʼ`´]/g, "");
}

export function trIncludes(haystack: string, needle: string): boolean {
  return normalizeTr(haystack).includes(normalizeTr(needle));
}
