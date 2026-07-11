// app/playlist/[id]/add-duas.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CATEGORIES } from "../../../constants/Categories";
import { Colors } from "../../../constants/Colors";
import duasData from "../../../data/duas.json";
import * as PlaylistService from "../../../services/playlistService";
import { Dua } from "../../../types/dua";

export default function AddDuasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [playlist, setPlaylist] = useState<any>(null);
  const [allDuas, setAllDuas] = useState<Dua[]>([]);
  const [filteredDuas, setFilteredDuas] = useState<Dua[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDuas, setSelectedDuas] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDuas();
  }, [selectedCategory, searchQuery, allDuas]);

  const loadData = async () => {
    const list = await PlaylistService.getPlaylist(id);
    setPlaylist(list);

    const duas = duasData.duas as Dua[];
    setAllDuas(duas);
    setFilteredDuas(duas);
  };

  const filterDuas = () => {
    let filtered = allDuas;

    // Kategoriye göre filtrele
    if (selectedCategory !== "all") {
      filtered = filtered.filter((dua) => dua.category === selectedCategory);
    }

    // Arama sorgusuna göre filtrele
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (dua) =>
          dua.title.toLowerCase().includes(query) ||
          dua.arabic.includes(query) ||
          dua.meaning.toLowerCase().includes(query)
      );
    }

    // Zaten ekli duaları çıkar
    if (playlist) {
      filtered = filtered.filter((dua) => !playlist.duaIds.includes(dua.id));
    }

    setFilteredDuas(filtered);
  };

  const toggleDuaSelection = (duaId: string) => {
    const newSelected = new Set(selectedDuas);
    if (newSelected.has(duaId)) {
      newSelected.delete(duaId);
    } else {
      newSelected.add(duaId);
    }
    setSelectedDuas(newSelected);
  };

  const handleAddSelected = async () => {
    if (selectedDuas.size === 0) {
      Alert.alert("Uyarı", "Lütfen en az bir dua seçin");
      return;
    }

    try {
      for (const duaId of Array.from(selectedDuas)) {
        await PlaylistService.addDuaToPlaylist(id, duaId);
      }

      Alert.alert("Başarılı", `${selectedDuas.size} dua listeye eklendi`, [
        {
          text: "Tamam",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert("Hata", "Dualar eklenirken bir hata oluştu");
    }
  };

  const handleSelectAll = () => {
    if (selectedDuas.size === filteredDuas.length) {
      setSelectedDuas(new Set());
    } else {
      setSelectedDuas(new Set(filteredDuas.map((d) => d.id)));
    }
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Dua Ekle
        </Text>
        <TouchableOpacity onPress={handleSelectAll}>
          <Ionicons
            name={
              selectedDuas.size === filteredDuas.length
                ? "checkbox"
                : "checkbox-outline"
            }
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Dua ara..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
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
            Tümü
          </Text>
        </TouchableOpacity>

        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategory === cat.slug && {
                backgroundColor: colors.primary,
              },
              selectedCategory !== cat.slug && { backgroundColor: colors.card },
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
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Duas List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredDuas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text-outline"
              size={60}
              color={colors.icon}
            />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {searchQuery
                ? "Arama sonucu bulunamadı"
                : "Bu kategoride eklenebilecek dua yok"}
            </Text>
          </View>
        ) : (
          filteredDuas.map((dua) => (
            <TouchableOpacity
              key={dua.id}
              style={[
                styles.duaCard,
                { backgroundColor: colors.card },
                selectedDuas.has(dua.id) && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => toggleDuaSelection(dua.id)}
              activeOpacity={0.7}
            >
              <View style={styles.duaInfo}>
                <Text style={[styles.duaTitle, { color: colors.text }]}>
                  {dua.title}
                </Text>
                <Text
                  style={[styles.duaArabic, { color: colors.icon }]}
                  numberOfLines={1}
                >
                  {dua.arabic}
                </Text>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryBadgeText,
                      { color: colors.primary },
                    ]}
                  >
                    {dua.category}
                  </Text>
                </View>
              </View>

              <View style={styles.checkbox}>
                <Ionicons
                  name={
                    selectedDuas.has(dua.id)
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={28}
                  color={
                    selectedDuas.has(dua.id) ? colors.primary : colors.border
                  }
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Bottom Bar */}
      {selectedDuas.size > 0 && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.selectedCount, { color: colors.text }]}>
            {selectedDuas.size} dua seçildi
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddSelected}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Listeye Ekle</Text>
          </TouchableOpacity>
        </View>
      )}
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
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
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
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  duaCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  duaInfo: {
    flex: 1,
  },
  duaTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  duaArabic: {
    fontSize: 13,
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  checkbox: {
    marginLeft: 12,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
  },
  selectedCount: {
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
