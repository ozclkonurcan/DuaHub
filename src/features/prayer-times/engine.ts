/**
 * Vakit motoru — saf TypeScript, UI'sız test edilebilir.
 * Tüm hesap cihazda yapılır (adhan); internet gerektirmez.
 */
import {
  CalculationMethod,
  Coordinates,
  PrayerTimes,
  type CalculationParameters,
} from "adhan";

export type CalculationMethodKey =
  | "turkey"
  | "mwl"
  | "isna"
  | "ummalqura"
  | "egyptian"
  | "karachi";

export const CALCULATION_METHODS: Record<
  CalculationMethodKey,
  { label: string; caption: string; params: () => CalculationParameters }
> = {
  turkey: {
    label: "Diyanet",
    caption: "Türkiye için önerilen",
    params: () => CalculationMethod.Turkey(),
  },
  mwl: {
    label: "Dünya İslam Birliği",
    caption: "Avrupa ve genel kullanım",
    params: () => CalculationMethod.MuslimWorldLeague(),
  },
  isna: {
    label: "ISNA",
    caption: "Kuzey Amerika",
    params: () => CalculationMethod.NorthAmerica(),
  },
  ummalqura: {
    label: "Ümmü'l-Kurâ",
    caption: "Suudi Arabistan",
    params: () => CalculationMethod.UmmAlQura(),
  },
  egyptian: {
    label: "Mısır",
    caption: "Mısır ve Afrika",
    params: () => CalculationMethod.Egyptian(),
  },
  karachi: {
    label: "Karaçi",
    caption: "Pakistan ve Güney Asya",
    params: () => CalculationMethod.Karachi(),
  },
};

export const DEFAULT_METHOD: CalculationMethodKey = "turkey";

export type PrayerName =
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: "İmsak",
  sunrise: "Güneş",
  dhuhr: "Öğle",
  asr: "İkindi",
  maghrib: "Akşam",
  isha: "Yatsı",
};

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface DayTimes {
  date: Date;
  times: Record<PrayerName, Date>;
}

export interface NextPrayer {
  name: PrayerName;
  time: Date;
}

/** Phase 1'de expo-location bağlanana dek varsayılan konum. */
export const DEFAULT_LOCATION: GeoPoint & { label: string } = {
  latitude: 41.0082,
  longitude: 28.9784,
  label: "İstanbul",
};

function calculate(
  location: GeoPoint,
  date: Date,
  method: CalculationMethodKey,
): PrayerTimes {
  const coordinates = new Coordinates(location.latitude, location.longitude);
  const params = CALCULATION_METHODS[method].params();
  return new PrayerTimes(coordinates, date, params);
}

export function getDayTimes(
  location: GeoPoint,
  date = new Date(),
  method: CalculationMethodKey = DEFAULT_METHOD,
): DayTimes {
  const pt = calculate(location, date, method);
  return {
    date,
    times: {
      fajr: pt.fajr,
      sunrise: pt.sunrise,
      dhuhr: pt.dhuhr,
      asr: pt.asr,
      maghrib: pt.maghrib,
      isha: pt.isha,
    },
  };
}

const ORDER: PrayerName[] = [
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

/** Şu andan sonraki ilk vakti döner; yatsıdan sonra yarının imsakına geçer. */
export function getNextPrayer(
  location: GeoPoint,
  now = new Date(),
  method: CalculationMethodKey = DEFAULT_METHOD,
): NextPrayer {
  const today = getDayTimes(location, now, method);
  for (const name of ORDER) {
    if (today.times[name] > now) {
      return { name, time: today.times[name] };
    }
  }
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const next = getDayTimes(location, tomorrow, method);
  return { name: "fajr", time: next.times.fajr };
}

/** Aktif (içinde bulunulan) vakit — listede vurgulamak için. */
export function getCurrentPrayer(
  location: GeoPoint,
  now = new Date(),
  method: CalculationMethodKey = DEFAULT_METHOD,
): PrayerName | null {
  const today = getDayTimes(location, now, method);
  let current: PrayerName | null = null;
  for (const name of ORDER) {
    if (today.times[name] <= now) current = name;
  }
  return current;
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatCountdown(target: Date, now = new Date()): string {
  const totalSeconds = Math.max(
    0,
    Math.floor((target.getTime() - now.getTime()) / 1000),
  );
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
