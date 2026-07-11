import { useEffect, useMemo, useState } from "react";

import { useLocationStore } from "@/stores/locationStore";
import { usePrayerSettings } from "@/stores/prayerSettings";

import {
  formatCountdown,
  getCurrentPrayer,
  getDayTimes,
  getNextPrayer,
  type DayTimes,
  type NextPrayer,
  type PrayerName,
} from "./engine";

interface PrayerTimesState {
  day: DayTimes;
  next: NextPrayer;
  current: PrayerName | null;
  countdown: string;
  locationLabel: string;
  /** true ise henüz GPS alınmamış, varsayılan şehir kullanılıyor. */
  isDefaultLocation: boolean;
}

/**
 * Bugün ekranının vakit durumu. Saniyede bir geri sayımı günceller;
 * konum değişince ve gün dönünce tüm hesap tazelenir.
 */
export function usePrayerTimes(): PrayerTimesState {
  const location = useLocationStore((s) => s.location);
  const source = useLocationStore((s) => s.source);
  const method = usePrayerSettings((s) => s.method);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dayKey = now.toDateString();
  const day = useMemo(
    () => getDayTimes(location, now, method),
    // Gün, konum ve metod değişmedikçe günlük tabloyu yeniden hesaplama.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dayKey, location, method],
  );

  const next = useMemo(
    () => getNextPrayer(location, now, method),
    [location, now, method],
  );
  const current = useMemo(
    () => getCurrentPrayer(location, now, method),
    [location, now, method],
  );

  return {
    day,
    next,
    current,
    countdown: formatCountdown(next.time, now),
    locationLabel: location.label,
    isDefaultLocation: source === "default",
  };
}
