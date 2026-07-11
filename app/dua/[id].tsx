import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Share, View } from "react-native";

import { Card, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/core/theme/useThemeColors";
import { getCategory, getDuaById } from "@/features/dua/data";
import { useFavoritesStore } from "@/stores/favoritesStore";

export default function DuaDetailScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dua = getDuaById(id);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

  if (!dua) {
    return (
      <Screen className="items-center justify-center">
        <Text variant="title">Dua bulunamadı</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="font-semibold text-primary">Geri dön</Text>
        </Pressable>
      </Screen>
    );
  }

  const category = getCategory(dua.category);
  const fav = isFavorite("dua", dua.id);

  const handleShare = () => {
    Share.share({
      message: `${dua.title}\n\n${dua.arabic}\n\n"${dua.transliteration}"\n\n${dua.meaning}\n(${dua.source})\n\nDuaHub`,
    }).catch(() => {});
  };

  return (
    <Screen scroll>
      {/* Başlık + geri + aksiyonlar */}
      <View className="mb-4 mt-2 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-raised active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </Pressable>
        <Text variant="title" className="flex-1" numberOfLines={1}>
          {dua.title}
        </Text>
        <Pressable
          onPress={handleShare}
          className="h-9 w-9 items-center justify-center rounded-full bg-raised active:opacity-70"
        >
          <Ionicons name="share-outline" size={18} color={colors.muted} />
        </Pressable>
        <Pressable
          onPress={() => toggleFavorite("dua", dua.id)}
          className={`h-9 w-9 items-center justify-center rounded-full active:opacity-70 ${
            fav ? "bg-gold" : "bg-raised"
          }`}
        >
          <Ionicons
            name={fav ? "heart" : "heart-outline"}
            size={18}
            color={fav ? colors.onPrimary : colors.muted}
          />
        </Pressable>
      </View>

      {/* Kategori + kaynak */}
      <View className="mb-4 flex-row items-center gap-2">
        {category ? (
          <View
            className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
            style={{ backgroundColor: `${category.color}22` }}
          >
            <Ionicons name={category.icon} size={12} color={category.color} />
            <Text
              className="text-xs font-semibold"
              style={{ color: category.color }}
            >
              {category.name}
            </Text>
          </View>
        ) : null}
        <Text variant="caption" className="text-xs">
          {dua.source}
        </Text>
      </View>

      {/* Arapça metin */}
      <Card className="mb-4 bg-raised py-6">
        <Text
          className="text-center text-3xl leading-[52px] text-ink"
          style={{ writingDirection: "rtl" }}
        >
          {dua.arabic}
        </Text>
      </Card>

      {/* Okunuş */}
      <Text variant="label" className="mb-2 ml-1">
        Okunuşu
      </Text>
      <Card className="mb-4">
        <Text className="italic leading-6 text-ink">
          {dua.transliteration}
        </Text>
      </Card>

      {/* Anlam */}
      <Text variant="label" className="mb-2 ml-1">
        Anlamı
      </Text>
      <Card className="mb-4">
        <Text className="leading-6">{dua.meaning}</Text>
      </Card>

      {/* Ne zaman okunur */}
      <Text variant="label" className="mb-2 ml-1">
        Ne Zaman Okunur?
      </Text>
      <Card className="mb-4 flex-row items-start gap-3">
        <Ionicons name="time-outline" size={18} color={colors.primary} />
        <Text variant="caption" className="flex-1 leading-5">
          {dua.benefit}
        </Text>
      </Card>
    </Screen>
  );
}
