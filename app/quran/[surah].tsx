import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, Pressable, View } from "react-native";

import { Card, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/core/theme/useThemeColors";
import { getAyahs, getSurah, type Ayah } from "@/features/quran/data";

const BESMELE = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

export default function SurahScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { surah: surahParam } = useLocalSearchParams<{ surah: string }>();
  const surahId = Number(surahParam);
  const surah = getSurah(surahId);

  const [ayahs, setAyahs] = useState<Ayah[] | null | "loading">("loading");

  useEffect(() => {
    let cancelled = false;
    getAyahs(surahId)
      .then((result) => {
        if (!cancelled) setAyahs(result);
      })
      .catch(() => {
        if (!cancelled) setAyahs(null);
      });
    return () => {
      cancelled = true;
    };
  }, [surahId]);

  if (!surah) {
    return (
      <Screen className="items-center justify-center">
        <Text variant="title">Sure bulunamadı</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="font-semibold text-primary">Geri dön</Text>
        </Pressable>
      </Screen>
    );
  }

  const renderAyah = ({ item }: { item: Ayah }) => (
    <Card className="mb-3">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="h-7 w-7 items-center justify-center rounded-full bg-raised">
          <Text className="font-mono text-xs font-bold text-primary">
            {item.number}
          </Text>
        </View>
        <Text variant="caption" className="text-xs">
          Cüz {item.juz} · Sayfa {item.page}
        </Text>
      </View>
      <Text
        className="text-right text-2xl leading-[44px] text-ink"
        style={{ writingDirection: "rtl" }}
      >
        {item.textAr}
      </Text>
      <Text variant="caption" className="mt-3 text-sm leading-6">
        {item.textTr}
      </Text>
    </Card>
  );

  return (
    <Screen>
      {/* Başlık */}
      <View className="mb-3 mt-2 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-raised active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </Pressable>
        <View className="flex-1">
          <Text variant="title">{surah.nameTr} Suresi</Text>
          <Text variant="caption" className="text-xs">
            {surah.revelation === "mekki" ? "Mekkî" : "Medenî"} ·{" "}
            {surah.ayahCount} ayet
          </Text>
        </View>
        <Text className="text-xl text-muted">{surah.nameAr}</Text>
      </View>

      {ayahs === "loading" ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : ayahs === null ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="phone-portrait-outline" size={32} color={colors.muted} />
          <Text variant="caption" className="mt-3 text-center leading-5">
            {Platform.OS === "web"
              ? "Kur'an metni web önizlemede desteklenmiyor — telefonda tamamen çevrimdışı çalışır."
              : "Kur'an veritabanı açılamadı. Uygulamayı yeniden başlatmayı dene."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={ayahs}
          keyExtractor={(a) => `${a.surahId}:${a.number}`}
          renderItem={renderAyah}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-8"
          initialNumToRender={8}
          ListHeaderComponent={
            surahId !== 1 && surahId !== 9 ? (
              <View className="mb-4 items-center rounded-card bg-raised py-4">
                <Text className="text-xl text-ink">{BESMELE}</Text>
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
}
