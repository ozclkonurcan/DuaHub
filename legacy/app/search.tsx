// app/search.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DuaCard from "../components/DuaCard";
import { CATEGORIES } from "../constants/Categories";
import { Colors } from "../constants/Colors";
import duasData from "../data/duas.json";
import { Dua } from "../types/dua";

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchResults, setSearchResults] = useState<Dua[]>([]);
  const [allDuas] = useState<Dua[]>(duasData.duas as Dua[]);

  useEffect(() => {
    performSearch();
  }, [searchQuery, selectedCategory]);

  const performSearch = () => {
    let filtered = allDuas;

    // Kategoriye göre filtrele
    if (selectedCategory !== "all") {
      filtered = filtered.filter((dua) => dua.category === selectedCategory);
    }

    // Arama sorgusuna göre filtrele
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (dua) =>
          dua.title.toLowerCase().includes(query) ||
          dua.arabic.includes(query) ||
          dua.transliteration.toLowerCase().includes(query) ||
          dua.meaning.toLowerCase().includes(query) ||
          (dua.tags &&
            dua.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    setSearchResults(filtered);
  };

  const handleFavoriteToggle = () => {
    // Kartlar kendi içinde hallediyor
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Dua ara..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={colors.icon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === "all" && { backgroundColor: colors.primary },
            selectedCategory !== "all" && { backgroundColor: colors.card },
          ]}
          onPress={() => setSelectedCategory("all")}
        >
          <Text
            style={[
              styles.categoryChipText,
              { color: selectedCategory === "all" ? "#FFFFFF" : colors.text },
            ]}
          >
            Tümü ({allDuas.length})
          </Text>
        </TouchableOpacity>

        {CATEGORIES.map((cat) => {
          const count = allDuas.filter((d) => d.category === cat.slug).length;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.slug && {
                  backgroundColor: colors.primary,
                },
                selectedCategory !== cat.slug && {
                  backgroundColor: colors.card,
                },
              ]}
              onPress={() => setSelectedCategory(cat.slug)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color:
                      selectedCategory === cat.slug ? "#FFFFFF" : colors.text,
                  },
                ]}
              >
                {cat.name} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Results */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {searchQuery.trim() === "" && selectedCategory === "all" ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={80} color={colors.icon} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Dua Ara
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
              Dua başlığı, Arapça metin veya anlam ile arayabilirsiniz
            </Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="sad-outline" size={80} color={colors.icon} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Sonuç Bulunamadı
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
              {searchQuery} için sonuç bulunamadı
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.resultCount, { color: colors.icon }]}>
              {searchResults.length} sonuç bulundu
            </Text>
            {searchResults.map((dua) => (
              <DuaCard
                key={dua.id}
                dua={dua}
                onFavoriteToggle={handleFavoriteToggle}
                showCategory={true}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  resultCount: {
    fontSize: 14,
    marginBottom: 16,
  },
});
