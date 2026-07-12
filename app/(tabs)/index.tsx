import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { Card, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/core/theme/useThemeColors";
import { formatGregorianDate, formatHijriDate } from "@/core/utils/hijri";
import { useLocationRefresh } from "@/features/location/useLocationRefresh";
import {
  PRAYER_LABELS,
  formatTime,
  type PrayerName,
} from "@/features/prayer-times/engine";
import { usePrayerTimes } from "@/features/prayer-times/usePrayerTimes";
import { getSurah } from "@/features/quran/data";
import {
  computeStreak,
  isReadToday,
  useQuranProgress,
} from "@/stores/quranProgress";

const PRAYER_ORDER: PrayerName[] = [
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

export default function TodayScreen() {
  const { day, next, current, countdown, locationLabel, isDefaultLocation } =
    usePrayerTimes();
  const { refresh, busy } = useLocationRefresh();
  const colors = useThemeColors();
  const hijri = formatHijriDate();
  const lastRead = useQuranProgress((s) => s.lastRead);
  const readDays = useQuranProgress((s) => s.readDays);
  const streak = computeStreak(readDays);
  const readToday = isReadToday(readDays);
  const lastReadSurah = lastRead ? getSurah(lastRead.surahId) : undefined;

  // İzin daha önce verildiyse açılışta konumu sessizce tazele.
  useEffect(() => {
    refresh({ request: false });
  }, [refresh]);

  return (
    <Screen scroll>
      {/* Başlık: tarih + konum çipi */}
      <View className="mb-5 mt-2">
        <Text variant="title">{formatGregorianDate()}</Text>
        <View className="mt-1 flex-row items-center gap-2">
          {hijri ? <Text variant="caption">{hijri}</Text> : null}
          <Pressable
            className="flex-row items-center gap-1 rounded-full bg-raised px-2.5 py-1 active:opacity-70"
            onPress={() => refresh({ request: true })}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator size={12} color={colors.muted} />
            ) : (
              <Ionicons
                name="location-outline"
                size={13}
                color={colors.muted}
              />
            )}
            <Text variant="caption" className="font-semibold">
              {locationLabel}
              {isDefaultLocation ? " · varsayılan" : ""}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Sonraki vakit kartı — Card değil: bg-surface ile çakışmasın diye düz View */}
      <View className="mb-4 items-center rounded-card bg-primary px-4 py-7">
        <Text variant="label" className="text-on-primary/80">
          Sonraki Vakit
        </Text>
        <Text variant="display" className="mt-1 text-on-primary">
          {PRAYER_LABELS[next.name]}
        </Text>
        <Text className="mt-1 text-lg font-semibold text-on-primary/90">
          {formatTime(next.time)}
        </Text>
        <View className="mt-3 rounded-full bg-on-primary/15 px-4 py-1.5">
          <Text className="font-mono text-base font-bold tracking-widest text-on-primary">
            {countdown}
          </Text>
        </View>
      </View>

      {/* Günün vakit listesi */}
      <Card className="mb-4">
        {PRAYER_ORDER.map((name, i) => {
          const isCurrent = current === name;
          return (
            <View
              key={name}
              className={`flex-row items-center justify-between py-3 ${
                i < PRAYER_ORDER.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <View className="flex-row items-center gap-3">
                {isCurrent ? (
                  <View className="h-2 w-2 rounded-full bg-gold" />
                ) : (
                  <View className="h-2 w-2 rounded-full bg-border" />
                )}
                <Text
                  className={
                    isCurrent ? "font-bold text-gold" : "font-medium text-ink"
                  }
                >
                  {PRAYER_LABELS[name]}
                </Text>
              </View>
              <Text
                className={
                  isCurrent ? "font-bold text-gold" : "font-semibold text-ink"
                }
              >
                {formatTime(day.times[name])}
              </Text>
            </View>
          );
        })}
      </Card>

      {/* Kur'an zinciri — okuma alışkanlığı kartı */}
      <Link
        href={
          lastRead
            ? {
                pathname: "/quran/[surah]",
                params: { surah: String(lastRead.surahId) },
              }
            : "/quran"
        }
        asChild
      >
        <Pressable className="mb-4 active:opacity-70">
          <Card className="flex-row items-center gap-3">
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${
                readToday ? "bg-gold/15" : "bg-raised"
              }`}
            >
              <Ionicons
                name="flame"
                size={20}
                color={readToday ? colors.gold : colors.muted}
              />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">
                {streak > 0 ? `${streak} günlük okuma zinciri` : "Kur'an zinciri başlat"}
              </Text>
              <Text variant="caption" className="text-xs">
                {lastRead && lastReadSurah
                  ? `Kaldığın yer: ${lastReadSurah.nameTr} ${lastRead.ayah}. ayet`
                  : "Bugün bir sayfa bile yeter — kaldığın yeri işaretle"}
              </Text>
            </View>
            {!readToday ? (
              <View className="rounded-full bg-primary px-3 py-1.5">
                <Text className="text-xs font-bold text-on-primary">
                  {lastRead ? "Devam et" : "Başla"}
                </Text>
              </View>
            ) : (
              <Ionicons name="checkmark-circle" size={20} color={colors.gold} />
            )}
          </Card>
        </Pressable>
      </Link>

      {/* Hızlı erişim */}
      <View className="flex-row gap-3">
        {(
          [
            { icon: "compass-outline", label: "Kıble", href: "/qibla" },
            { icon: "ellipse-outline", label: "Zikirmatik", href: "/dhikr" },
            { icon: "heart-outline", label: "Dualar", href: "/dua" },
          ] as const
        ).map((item) => (
          <Link key={item.label} href={item.href} asChild>
            <Pressable className="flex-1 active:opacity-70">
              <Card className="items-center py-4">
                <Ionicons name={item.icon} size={22} color={colors.primary} />
                <Text
                  variant="caption"
                  className="mt-2 font-semibold text-ink"
                >
                  {item.label}
                </Text>
              </Card>
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}
