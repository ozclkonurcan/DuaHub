/**
 * Hicri tarih biçimlendirme. Intl islami takvimi desteklemiyorsa null döner;
 * çağıran taraf bu durumda Hicri satırı gizler.
 */
export function formatHijriDate(date: Date = new Date()): string | null {
  try {
    const formatted = new Intl.DateTimeFormat("tr-TR-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
    // Bazı ortamlar takvimi sessizce yok sayıp Miladi döndürür; basit doğrulama:
    const hijriYear = Number(formatted.match(/\d{3,4}/)?.[0]);
    if (!hijriYear || hijriYear > 1600) return null;
    return formatted;
  } catch {
    return null;
  }
}

export function formatGregorianDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}
