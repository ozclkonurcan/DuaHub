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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DuaCard from "../../components/DuaCard";
import WeatherWidget from "../../components/WeatherWidget";
import { Colors } from "../../constants/Colors";
import duasData from "../../data/duas.json";
import { Dua } from "../../types/dua";
import i18n from "../../utils/i18n";
import { useTheme } from "../../context/ThemeContext";

export default function HomeScreen() {
  const { colors } = useTheme();

  const [duas, setDuas] = useState<Dua[]>([]);
  const [dailyDua, setDailyDua] = useState<Dua | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadDuas();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, [])
  );

  const loadDuas = () => {
    const loadedDuas = duasData.duas as Dua[];
    setDuas(loadedDuas);
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

        {/* Weather Widget */}
        <WeatherWidget />

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

        {/* Hızlı Erişim / Tools Grid */}
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t("tools")}</Text>
        </View>

        <View style={styles.toolsGrid}>
            <TouchableOpacity style={[styles.gridItem, { backgroundColor: colors.card }]} onPress={() => router.push("/quran")}>
                <Ionicons name="book" size={28} color={colors.primary} />
                <Text style={[styles.gridText, { color: colors.text }]}>{i18n.t("quran")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.gridItem, { backgroundColor: colors.card }]} onPress={() => router.push("/imsakiye")}>
                <Ionicons name="calendar" size={28} color={colors.primary} />
                <Text style={[styles.gridText, { color: colors.text }]}>{i18n.t("prayerTimes")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.gridItem, { backgroundColor: colors.card }]} onPress={() => router.push("/qibla")}>
                <Ionicons name="compass" size={28} color={colors.success} />
                <Text style={[styles.gridText, { color: colors.text }]}>{i18n.t("qibla")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.gridItem, { backgroundColor: colors.card }]} onPress={() => router.push("/tasbih")}>
                <Ionicons name="finger-print" size={28} color={colors.accent} />
                <Text style={[styles.gridText, { color: colors.text }]}>{i18n.t("tasbih")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.gridItem, { backgroundColor: colors.card }]} onPress={() => router.push("/community")}>
                <Ionicons name="people" size={28} color={colors.primary} />
                <Text style={[styles.gridText, { color: colors.text }]}>{i18n.t("community")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.gridItem, { backgroundColor: colors.card }]} onPress={() => router.push("/live-kaaba")}>
                <Ionicons name="videocam" size={28} color="#FF3B30" />
                <Text style={[styles.gridText, { color: colors.text }]}>{i18n.t("liveKaaba")}</Text>
            </TouchableOpacity>

             <TouchableOpacity style={[styles.gridItem, { backgroundColor: colors.card }]} onPress={() => router.push("/religious-days")}>
                <Ionicons name="moon" size={28} color={colors.primary} />
                <Text style={[styles.gridText, { color: colors.text }]}>{i18n.t("religiousDays")}</Text>
            </TouchableOpacity>

             <TouchableOpacity style={[styles.gridItem, { backgroundColor: colors.card }]} onPress={() => router.push("/hijri")}>
                <Ionicons name="today" size={28} color={colors.primary} />
                <Text style={[styles.gridText, { color: colors.text }]}>{i18n.t("hijriCalendar")}</Text>
            </TouchableOpacity>
        </View>

        {/* Popüler Dualar */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {i18n.t("popularDuas")}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/categories")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                {i18n.t("seeAll")}
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
  section: {
    marginTop: 24,
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
  toolsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
  },
  gridItem: {
      width: '48%', // Approx 2 cols
      aspectRatio: 1.4,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
  },
  gridText: {
      fontSize: 14,
      fontWeight: '500',
  }
});
