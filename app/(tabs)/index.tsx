// app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DuaCard from "../../components/DuaCard";
import { Colors } from "../../constants/Colors";
import duasData from "../../data/duas.json";
import { Dua } from "../../types/dua";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [duas, setDuas] = useState<Dua[]>([]);
  const [dailyDua, setDailyDua] = useState<Dua | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadDuas();
  }, []);

  // Sayfa her görünür olduğunda kartları yenile (favoriler güncel olsun)
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, [])
  );

  const loadDuas = () => {
    // Şimdilik local data'dan yüklüyoruz
    // Sonra Firebase'den çekeceğiz
    const loadedDuas = duasData.duas as Dua[];
    setDuas(loadedDuas);

    // Günün duasını rastgele seç
    const randomDua = loadedDuas[Math.floor(Math.random() * loadedDuas.length)];
    setDailyDua(randomDua);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDuas();
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleFavoriteToggle = (duaId: string) => {
    // Favoriler değiştiğinde kartları yenile
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.icon }]}>
              Hoş geldiniz
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              DuaHub 🤲
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: colors.card }]}
            onPress={() => router.push("/search")}
          >
            <Ionicons name="search" size={20} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* Günün Duası */}
        {dailyDua && (
          <View
            style={[
              styles.dailyDuaContainer,
              { backgroundColor: colors.primary },
            ]}
          >
            <View style={styles.dailyDuaHeader}>
              <Ionicons name="sunny" size={24} color="#FFFFFF" />
              <Text style={styles.dailyDuaTitle}>Günün Duası</Text>
            </View>
            <Text style={styles.dailyDuaText} numberOfLines={3}>
              {dailyDua.arabic}
            </Text>
            <TouchableOpacity
              style={styles.dailyDuaButton}
              onPress={() => dailyDua && router.push(`/dua/${dailyDua.id}`)}
            >
              <Text style={styles.dailyDuaButtonText}>Duayı Oku</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Hızlı Erişim */}
        <View style={styles.quickAccess}>
          <TouchableOpacity
            style={[styles.quickAccessItem, { backgroundColor: colors.card }]}
              onPress={() => router.push("/tasbih")}
          >
            <View
              style={[
                styles.quickAccessIcon,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
                <Ionicons name="finger-print" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.quickAccessText, { color: colors.text }]}>
                Zikirmatik
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAccessItem, { backgroundColor: colors.card }]}
            onPress={() => router.push("/(tabs)/favorites")}
          >
            <View
              style={[
                styles.quickAccessIcon,
                { backgroundColor: colors.error + "20" },
              ]}
            >
              <Ionicons name="heart" size={24} color={colors.error} />
            </View>
            <Text style={[styles.quickAccessText, { color: colors.text }]}>
              Favoriler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAccessItem, { backgroundColor: colors.card }]}
              onPress={() => router.push("/reminders")}
          >
            <View
              style={[
                styles.quickAccessIcon,
                { backgroundColor: colors.success + "20" },
              ]}
            >
              <Ionicons name="notifications" size={24} color={colors.success} />
            </View>
            <Text style={[styles.quickAccessText, { color: colors.text }]}>
              Hatırlatıcılar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Popüler Dualar */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Popüler Dualar
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/categories")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                Tümünü Gör
              </Text>
            </TouchableOpacity>
          </View>

          {duas.slice(0, 5).map((dua) => (
            <DuaCard
              key={`${dua.id}-${refreshKey}`}
              dua={dua}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  dailyDuaContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  dailyDuaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dailyDuaTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  dailyDuaText: {
    fontSize: 16,
    lineHeight: 28,
    textAlign: "right",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  dailyDuaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 8,
  },
  dailyDuaButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  quickAccess: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  quickAccessItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickAccessText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "500",
  },
});
