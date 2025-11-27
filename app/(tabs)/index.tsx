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
import i18n from "../../utils/i18n";

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
              {i18n.t("welcome")}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {i18n.t("appName")}
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
              <Text style={styles.dailyDuaTitle}>{i18n.t("dailyDua")}</Text>
            </View>
            <Text style={styles.dailyDuaText} numberOfLines={3}>
              {dailyDua.arabic}
            </Text>
            <TouchableOpacity
              style={styles.dailyDuaButton}
              onPress={() => dailyDua && router.push(`/dua/${dailyDua.id}`)}
            >
              <Text style={styles.dailyDuaButtonText}>{i18n.t("readDua")}</Text>
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
              {i18n.t("tasbih")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAccessItem, { backgroundColor: colors.card }]}
            onPress={() => router.push("/tracker")}
          >
            <View
              style={[
                styles.quickAccessIcon,
                { backgroundColor: colors.accent + "20" },
              ]}
            >
              <Ionicons name="checkbox" size={24} color={colors.accent} />
            </View>
            <Text style={[styles.quickAccessText, { color: colors.text }]}>
              Amel Defteri
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAccessItem, { backgroundColor: colors.card }]}
            onPress={() => router.push("/imsakiye")}
          >
            <View
              style={[
                styles.quickAccessIcon,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons name="calendar" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.quickAccessText, { color: colors.text }]}>
              İmsakiye
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAccessItem, { backgroundColor: colors.card }]}
            onPress={() => router.push("/mosques")}
          >
            <View
              style={[
                styles.quickAccessIcon,
                { backgroundColor: colors.success + "20" },
              ]}
            >
              <Ionicons name="map" size={24} color={colors.success} />
            </View>
            <Text style={[styles.quickAccessText, { color: colors.text }]}>
              Haritalar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Diğer Özellikler (2. Satır) */}
        <View style={styles.quickAccess}>
            <TouchableOpacity
                style={[styles.quickAccessItem, { backgroundColor: colors.card }]}
                onPress={() => router.push("/esmaulhusna")}
            >
                <View style={[styles.quickAccessIcon, { backgroundColor: colors.accent + "20" }]}>
                    <Ionicons name="list" size={24} color={colors.accent} />
                </View>
                <Text style={[styles.quickAccessText, { color: colors.text }]}>{i18n.t("esmaulhusna")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.quickAccessItem, { backgroundColor: colors.card }]}
                onPress={() => router.push("/library")}
            >
                <View style={[styles.quickAccessIcon, { backgroundColor: colors.primary + "20" }]}>
                    <Ionicons name="library" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.quickAccessText, { color: colors.text }]}>Kütüphane</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.quickAccessItem, { backgroundColor: colors.card }]}
                onPress={() => router.push("/radio")}
            >
                <View style={[styles.quickAccessIcon, { backgroundColor: colors.success + "20" }]}>
                    <Ionicons name="radio" size={24} color={colors.success} />
                </View>
                <Text style={[styles.quickAccessText, { color: colors.text }]}>Kuran Radyo</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.quickAccessItem, { backgroundColor: colors.card }]}
                onPress={() => router.push("/zekat")}
            >
                <View style={[styles.quickAccessIcon, { backgroundColor: colors.primary + "20" }]}>
                    <Ionicons name="calculator" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.quickAccessText, { color: colors.text }]}>{i18n.t("zekat")}</Text>
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
