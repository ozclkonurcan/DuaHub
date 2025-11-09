// app/(tabs)/favorites.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DuaCard from "../../components/DuaCard";
import { Colors } from "../../constants/Colors";
import duasData from "../../data/duas.json";
import * as StorageService from "../../services/storageService";
import { Dua } from "../../types/dua";

export default function FavoritesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [favoriteDuas, setFavoriteDuas] = useState<Dua[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Sayfa her görünür olduğunda favorileri yeniden yükle
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const favoriteIds = await StorageService.getFavorites();
    const allDuas = duasData.duas as Dua[];

    // Favorilere eklenmiş duaları filtrele
    const favorites = allDuas
      .filter((dua) => favoriteIds.includes(dua.id))
      .map((dua) => ({ ...dua, isFavorite: true }));

    setFavoriteDuas(favorites);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleFavoriteToggle = async (duaId: string) => {
    // Favoriden çıkar
    await StorageService.removeFavorite(duaId);

    // Listeyi güncelle
    setFavoriteDuas((prevDuas) => prevDuas.filter((dua) => dua.id !== duaId));
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Favorilerim</Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          {favoriteDuas.length} favori dua
        </Text>
      </View>

      {favoriteDuas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconContainer,
              { backgroundColor: colors.card },
            ]}
          >
            <Ionicons name="heart-outline" size={64} color={colors.icon} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Henüz favori dua yok
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
            Beğendiğiniz duaları favorilerinize ekleyin
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {favoriteDuas.map((dua) => (
            <DuaCard
              key={dua.id}
              dua={dua}
              onFavoriteToggle={handleFavoriteToggle}
              showCategory={true}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
});
