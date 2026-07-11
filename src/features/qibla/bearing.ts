/**
 * Kıble yönü matematiği — saf fonksiyonlar, UI'sız test edilebilir.
 */
import type { GeoPoint } from "@/features/prayer-times/engine";

/** Kâbe koordinatları (Mescid-i Haram). */
export const KAABA: GeoPoint = { latitude: 21.4225, longitude: 39.8262 };

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Bulunulan noktadan Kâbe'ye great-circle kerteriz açısı (0-360, kuzeyden saat yönü). */
export function qiblaBearing(from: GeoPoint): number {
  const φ1 = toRad(from.latitude);
  const φ2 = toRad(KAABA.latitude);
  const Δλ = toRad(KAABA.longitude - from.longitude);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Kâbe'ye haversine mesafesi (km). */
export function distanceToKaabaKm(from: GeoPoint): number {
  const R = 6371;
  const φ1 = toRad(from.latitude);
  const φ2 = toRad(KAABA.latitude);
  const Δφ = toRad(KAABA.latitude - from.latitude);
  const Δλ = toRad(KAABA.longitude - from.longitude);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Cihaz yönü ile kıble arasındaki fark (-180..180).
 * 0'a yaklaştıkça cihaz kıbleye dönük demektir.
 */
export function headingDelta(qibla: number, heading: number): number {
  return ((qibla - heading + 540) % 360) - 180;
}
