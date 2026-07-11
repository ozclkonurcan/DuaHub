/**
 * Bildirim planı üretici — saf fonksiyon, UI'sız test edilebilir.
 * iOS'un 64 zamanlanmış bildirim limitine güvenli mesafe için plan 60 ile sınırlanır;
 * limit dolarsa gün sayısı kendiliğinden kısalır (en yakın bildirimler önceliklidir).
 */
import {
  DEFAULT_METHOD,
  PRAYER_LABELS,
  formatTime,
  getDayTimes,
  type CalculationMethodKey,
  type GeoPoint,
  type PrayerName,
} from "@/features/prayer-times/engine";
import type { NotificationSettings } from "@/stores/notificationSettings";

export interface PlannedNotification {
  prayer: PrayerName;
  kind: "adhan" | "reminder";
  fireDate: Date;
  title: string;
  body: string;
}

interface PlanOptions {
  now?: Date;
  days?: number;
  maxItems?: number;
  method?: CalculationMethodKey;
}

export function buildNotificationPlan(
  location: GeoPoint & { label: string },
  settings: NotificationSettings,
  {
    now = new Date(),
    days = 7,
    maxItems = 60,
    method = DEFAULT_METHOD,
  }: PlanOptions = {},
): PlannedNotification[] {
  if (!settings.masterEnabled) return [];

  const enabledPrayers = (
    Object.keys(settings.prayers) as PrayerName[]
  ).filter((p) => settings.prayers[p]);
  if (enabledPrayers.length === 0) return [];

  const items: PlannedNotification[] = [];

  for (let offset = 0; offset < days; offset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    const day = getDayTimes(location, date, method);

    for (const prayer of enabledPrayers) {
      const time = day.times[prayer];
      const label = PRAYER_LABELS[prayer];

      if (time > now) {
        items.push({
          prayer,
          kind: "adhan",
          fireDate: time,
          title: `${label} Vakti`,
          body: `${location.label} için ${label.toLocaleLowerCase("tr")} vakti girdi · ${formatTime(time)}`,
        });
      }

      if (settings.preReminderMinutes > 0) {
        const reminderTime = new Date(
          time.getTime() - settings.preReminderMinutes * 60_000,
        );
        if (reminderTime > now) {
          items.push({
            prayer,
            kind: "reminder",
            fireDate: reminderTime,
            title: `${label} vaktine ${settings.preReminderMinutes} dk`,
            body: `${label} vakti ${formatTime(time)} · hazırlanmak için vakit var.`,
          });
        }
      }
    }
  }

  items.sort((a, b) => a.fireDate.getTime() - b.fireDate.getTime());
  return items.slice(0, maxItems);
}
