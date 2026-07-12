import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";

import { Card, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/core/theme/useThemeColors";
import { getSurah, searchSurahs, type SurahMeta } from "@/features/quran/data";
import {
  computeStreak,
  khatmPercent,
  useQuranProgress,
} from "@/stores/quranProgress";

export default function QuranScreen() {
  const colors = useThemeColors();
  const [query, setQuery] = useState("");
  const surahs = useMemo(() => searchSurahs(query), [query]);
  const lastRead = useQuranProgress((s) => s.lastRead);
  const readDays = useQuranProgress((s) => s.readDays);
  const streak = computeStreak(readDays);
  const lastReadSurah = lastRead ? getSurah(lastRead.surahId) : undefined;
  const percent = khatmPercent(lastRead);

  const renderItem = ({ item }: { item: SurahMeta }) => (
    <Link
      href={{ pathname: "/quran/[surah]", params: { surah: String(item.id) } }}
      asChild
    >
      <Pressable className="mb-2.5 active:opacity-70">
        <Card className="flex-row items-center gap-3 py-3.5">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-raised">
            <Text className="font-mono text-sm font-bold text-primary">
              {item.id}
            </Text>
          </View>
          <View className="flex-1">
            <Text variant="heading">{item.nameTr} Suresi</Text>
            <Text variant="caption" className="mt-0.5 text-xs">
              {item.revelation === "mekki" ? "Mekkî" : "Medenî"} ·{" "}
              {item.ayahCount} ayet
            </Text>
          </View>
          <Text className="text-lg text-muted">{item.nameAr}</Text>
        </Card>
      </Pressable>
    </Link>
  );

  return (
    <Screen>
      <View className="mb-3 mt-2 flex-row items-center justify-between">
        <Text variant="title">Kur&apos;an-ı Kerim</Text>
        {streak > 0 ? (
          <View className="flex-row items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1">
            <Ionicons name="flame" size={13} color={colors.gold} />
            <Text className="text-xs font-bold text-gold">{streak} gün</Text>
          </View>
        ) : null}
      </View>

      {/* Kaldığın yer — hatim ilerlemesi */}
      {lastRead && lastReadSurah ? (
        <Link
          href={{
            pathname: "/quran/[surah]",
            params: { surah: String(lastRead.surahId) },
          }}
          asChild
        >
          <Pressable className="mb-3 active:opacity-80">
            <View className="rounded-card bg-primary p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text variant="label" className="text-on-primary/80">
                    Kaldığın Yer
                  </Text>
                  <Text className="mt-0.5 text-lg font-bold text-on-primary">
                    {lastReadSurah.nameTr} Suresi · {lastRead.ayah}. ayet
                  </Text>
                  <Text className="text-xs font-medium text-on-primary/80">
                    Sayfa {lastRead.page} / 604 · hatim %{percent}
                  </Text>
                </View>
                <Ionicons
                  name="play-circle"
                  size={34}
                  color={colors.onPrimary}
                />
              </View>
              <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-on-primary/20">
                <View
                  className="h-full rounded-full bg-on-primary"
                  style={{ width: `${Math.max(percent, 2)}%` }}
                />
              </View>
            </View>
          </Pressable>
        </Link>
      ) : null}

      {/* Arama */}
      <View className="mb-3 flex-row items-center gap-2 rounded-2xl border border-border bg-surface px-3">
        <Ionicons name="search" size={16} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Sure ara: Yasin, Mülk, 36…"
          placeholderTextColor={colors.muted}
          className="flex-1 py-3 text-base text-ink"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={16} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={surahs}
        keyExtractor={(s) => String(s.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
        initialNumToRender={15}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="search-outline" size={32} color={colors.muted} />
            <Text variant="caption" className="mt-3">
              Aramanla eşleşen sure bulunamadı.
            </Text>
          </View>
        }
      />
    </Screen>
  );
}
