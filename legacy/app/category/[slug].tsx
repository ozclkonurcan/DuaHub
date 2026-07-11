// app/category/[slug].tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DuaCard from "../../components/DuaCard";
import { getCategoryBySlug } from "../../constants/Categories";
import { Colors } from "../../constants/Colors";
import duasData from "../../data/duas.json";
import { CategorySlug, Dua } from "../../types/dua";

export default function CategoryDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [duas, setDuas] = useState<Dua[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const category = getCategoryBySlug(slug as CategorySlug);

  useEffect(() => {
    if (slug) {
      const allDuas = duasData.duas as Dua[];
      const filteredDuas = allDuas.filter((dua) => dua.category === slug);
      setDuas(filteredDuas);
    }
  }, [slug]);

  // Sayfa her görünür olduğunda kartları yenile
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, [])
  );

  const handleFavoriteToggle = (duaId: string) => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!category) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>Kategori bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: category.color + "20" }]}>
        <View
          style={[styles.iconContainer, { backgroundColor: category.color }]}
        >
          <Ionicons name={category.icon as any} size={32} color="#FFFFFF" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {category.name}
        </Text>
        <Text style={[styles.description, { color: colors.icon }]}>
          {category.description}
        </Text>
        <Text style={[styles.duaCount, { color: colors.icon }]}>
          {duas.length} dua
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {duas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={colors.icon}
            />
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              Bu kategoride henüz dua bulunmuyor
            </Text>
          </View>
        ) : (
          duas.map((dua) => (
            <DuaCard
              key={`${dua.id}-${refreshKey}`}
              dua={dua}
              onFavoriteToggle={handleFavoriteToggle}
              showCategory={false}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  duaCount: {
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
});
