// services/prayerTimesService.ts
import axios from 'axios';

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
}

// Aladhan API kullanarak namaz vakitlerini al
export async function getPrayerTimes(
  latitude: number,
  longitude: number,
  method: number = 13 // 13 = Diyanet (Türkiye)
): Promise<PrayerTimes | null> {
  try {
    const response = await axios.get(
      `https://api.aladhan.com/v1/timings`,
      {
        params: {
          latitude,
          longitude,
          method,
        },
      }
    );

    const timings = response.data.data.timings;
    const date = response.data.data.date.readable;

    return {
      fajr: timings.Fajr,
      sunrise: timings.Sunrise,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha,
      date,
    };
  } catch (error) {
    console.error('Namaz vakitleri alınamadı:', error);
    return null;
  }
}

// Ramazan için iftar/sahur saatlerini hesapla
export async function getRamadanTimes(
  latitude: number,
  longitude: number
): Promise<{ iftar: string; sahur: string } | null> {
  const times = await getPrayerTimes(latitude, longitude);
  if (!times) return null;

  return {
    iftar: times.maghrib, // İftar = Akşam ezanı
    sahur: times.fajr,    // Sahur = İmsak (Sabah ezanı)
  };
}

// Saat string'ini parse et (HH:MM formatından)
export function parseTime(timeStr: string): { hour: number; minute: number } {
  const [hour, minute] = timeStr.split(':').map(Number);
  return { hour, minute };
}