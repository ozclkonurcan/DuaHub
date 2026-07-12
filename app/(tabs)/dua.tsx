import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, TextInput, View } from "react-native";

import { Card, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/core/theme/useThemeColors";
import {
  ALL_DUAS,
  DUA_CATEGORIES,
  getCategory,
  searchDuas,
  type Dua,
} from "@/features/dua/data";
import { useFavoritesStore } from "@/stores/favoritesStore";

export default function DuaScreen() {
  const colors = useThemeColors();
  const [query, setQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  const favoriteEntries = useFavoritesStore((s) => s.entries);

  const duas = useMemo(() => {
    let base = searchDuas(ALL_DUAS, query, categorySlug);
    if (onlyFavorites)
      base = base.filter((d) => favoriteEntries[`dua:${d.id}`]?.favorited);
    return base;
  }, [query, categorySlug, onlyFavorites, favoriteEntries]);

  const renderItem = ({ item }: { item: Dua }) => {
    const category = getCategory(item.category);
    const fav = isFavorite("dua", item.id);
    return (
      <Link href={{ pathname: "/dua/[id]", params: { id: item.id } }} asChild>
        <Pressable className="mb-3 active:opacity-70">
          <Card>
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text variant="heading">{item.title}</Text>
                <Text variant="caption" className="mt-1 leading-5" numberOfLines={2}>
                  {item.meaning}
                </Text>
              </View>
              <Ionicons
                name={fav ? "heart" : "heart-outline"}
                size={18}
                color={fav ? colors.gold : colors.muted}
              />
            </View>
            <View className="mt-3 flex-row items-center gap-2">
              {category ? (
                <View
                  className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
                  style={{ backgroundColor: `${category.color}22` }}
                >
                  <Ionicons
                    name={category.icon}
                    size={12}
                    color={category.color}
                  />
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: category.color }}
                  >
                    {category.name}
                  </Text>
                </View>
              ) : null}
              <Text variant="caption" className="text-xs">
                {item.source}
              </Text>
            </View>
          </Card>
        </Pressable>
      </Link>
    );
  };

  return (
    <Screen>
      {/* Başlık + favori filtresi */}
      <View className="mb-3 mt-2 flex-row items-center justify-between">
        <Text variant="title">Dua & Zikir</Text>
        <Pressable
          onPress={() => setOnlyFavorites((v) => !v)}
          className={`h-9 w-9 items-center justify-center rounded-full active:opacity-70 ${
            onlyFavorites ? "bg-gold" : "bg-raised"
          }`}
        >
          <Ionicons
            name={onlyFavorites ? "heart" : "heart-outline"}
            size={18}
            color={onlyFavorites ? colors.onPrimary : colors.muted}
          />
        </Pressable>
      </View>

      {/* Arama */}
      <View className="mb-3 flex-row items-center gap-2 rounded-2xl border border-border bg-surface px-3">
        <Ionicons name="search" size={16} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Dua ara: sınav, yolculuk, şifa…"
          placeholderTextColor={colors.muted}
          className="flex-1 py-3 text-base text-ink"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={16} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {/* Kategori çipleri — RN-web yatay ScrollView'da esnek yükseklik çöküyor;
          çipe h-9, konteynere h-10 açık yükseklik veriyoruz */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-3 h-10 flex-grow-0"
        contentContainerClassName="items-center gap-2"
      >
        <Pressable
          onPress={() => setCategorySlug(null)}
          className={`h-9 items-center justify-center rounded-full border px-4 active:opacity-70 ${
            categorySlug === null
              ? "border-primary bg-primary"
              : "border-border bg-surface"
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              categorySlug === null ? "text-on-primary" : "text-ink"
            }`}
          >
            Tümü
          </Text>
        </Pressable>
        {DUA_CATEGORIES.map((c) => {
          const active = categorySlug === c.slug;
          return (
            <Pressable
              key={c.slug}
              onPress={() => setCategorySlug(active ? null : c.slug)}
              className={`h-9 items-center justify-center rounded-full border px-4 active:opacity-70 ${
                active ? "border-primary bg-primary" : "border-border bg-surface"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  active ? "text-on-primary" : "text-ink"
                }`}
              >
                {c.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Liste */}
      <FlatList
        data={duas}
        keyExtractor={(d) => d.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="search-outline" size={32} color={colors.muted} />
            <Text variant="caption" className="mt-3">
              {onlyFavorites
                ? "Henüz favori duan yok — kalbe dokunarak ekle."
                : "Aramanla eşleşen dua bulunamadı."}
            </Text>
          </View>
        }
      />
    </Screen>
  );
}
