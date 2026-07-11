import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { Platform, Pressable, View } from "react-native";

import { Card, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/core/theme/useThemeColors";
import {
  distanceToKaabaKm,
  headingDelta,
  qiblaBearing,
} from "@/features/qibla/bearing";
import { useCompassHeading } from "@/features/qibla/useCompassHeading";
import { useLocationStore } from "@/stores/locationStore";

const ALIGNED_THRESHOLD_DEG = 4;

export default function QiblaScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const location = useLocationStore((s) => s.location);
  const source = useLocationStore((s) => s.source);
  const { heading, accuracy } = useCompassHeading();

  const bearing = useMemo(() => qiblaBearing(location), [location]);
  const distanceKm = useMemo(() => distanceToKaabaKm(location), [location]);

  const hasCompass = heading !== null;
  const delta = hasCompass ? headingDelta(bearing, heading) : 0;
  const aligned = hasCompass && Math.abs(delta) <= ALIGNED_THRESHOLD_DEG;
  const lowAccuracy = accuracy !== null && accuracy <= 1;

  // Kıbleye hizalanınca bir kez haptic geri bildirim.
  useEffect(() => {
    if (aligned && Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [aligned]);

  const accent = aligned ? colors.gold : colors.primary;

  return (
    <Screen>
      {/* Başlık + geri */}
      <View className="mb-2 mt-2 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-raised active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </Pressable>
        <Text variant="title">Kıble</Text>
      </View>

      <View className="flex-1 items-center justify-center">
        {/* Pusula kadranı: cihaz dönünce kadran ters yönde döner,
            Kâbe işareti kadran üzerinde kıble açısında sabittir. */}
        <View
          className={`h-72 w-72 items-center justify-center rounded-full border-4 ${
            aligned ? "border-gold" : "border-border"
          } bg-surface`}
        >
          <View
            className="absolute h-full w-full items-center"
            style={{
              transform: [{ rotate: `${hasCompass ? -heading! : 0}deg` }],
            }}
          >
            {/* Kuzey işareti */}
            <Text className="mt-3 text-sm font-bold text-muted">K</Text>
            {/* Kâbe işareti — kadran merkezinde kıble açısına döndürülmüş kol */}
            <View
              className="absolute h-full w-full items-center"
              style={{ transform: [{ rotate: `${bearing}deg` }] }}
            >
              <View
                className={`mt-8 h-14 w-14 items-center justify-center rounded-full ${
                  aligned ? "bg-gold" : "bg-primary"
                }`}
              >
                <Ionicons name="cube" size={26} color={colors.onPrimary} />
              </View>
            </View>
          </View>

          {/* Sabit cihaz oku (yukarı bakar) */}
          <Ionicons
            name="caret-up"
            size={34}
            color={accent}
            style={{ position: "absolute", top: -24 }}
          />

          <View className="items-center">
            <Text variant="display" style={{ color: accent }}>
              {Math.round(hasCompass ? Math.abs(delta) : bearing)}°
            </Text>
            <Text variant="caption" className="mt-1">
              {hasCompass
                ? aligned
                  ? "Kıbleye dönüksün"
                  : delta > 0
                    ? "Sağa dön"
                    : "Sola dön"
                : `Kıble açısı (kuzeyden)`}
            </Text>
          </View>
        </View>

        {/* Bilgi kartı */}
        <Card className="mt-8 w-full">
          <View className="flex-row items-center justify-between">
            <View>
              <Text variant="label">Konum</Text>
              <Text className="mt-0.5 font-semibold">
                {location.label}
                {source === "default" ? " (varsayılan)" : ""}
              </Text>
            </View>
            <View className="items-end">
              <Text variant="label">Kâbe&apos;ye Uzaklık</Text>
              <Text className="mt-0.5 font-semibold">
                {Math.round(distanceKm).toLocaleString("tr-TR")} km
              </Text>
            </View>
          </View>
          {!hasCompass ? (
            <Text variant="caption" className="mt-3 leading-5">
              Bu cihazda pusula verisi yok. Kıble, kuzeyden saat yönünde{" "}
              {Math.round(bearing)}° yönündedir — fiziksel bir pusulayla
              hizalayabilirsin.
            </Text>
          ) : lowAccuracy ? (
            <Text variant="caption" className="mt-3 leading-5">
              Pusula hassasiyeti düşük. Telefonu 8 çizer gibi hareket ettirerek
              kalibre et; metal cisimlerden uzak dur.
            </Text>
          ) : null}
        </Card>
      </View>
    </Screen>
  );
}
