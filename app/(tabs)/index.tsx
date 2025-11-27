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
  ImageBackground,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DuaCard from "../../components/DuaCard";
import WeatherWidget from "../../components/WeatherWidget";
import { ThemedCard } from "../../components/ThemedCard";
import duasData from "../../data/duas.json";
import { Dua } from "../../types/dua";
import i18n from "../../utils/i18n";
import { useTheme } from "../../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, isDark } = useTheme();

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

  const QuickAccessButton = ({ icon, label, route, color }: any) => (
    <TouchableOpacity
        style={[styles.quickAccessBtn, { backgroundColor: colors.card }]}
        onPress={() => router.push(route)}
    >
        <View style={[styles.quickAccessIcon, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={[styles.quickAccessLabel, { color: colors.text }]} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Decorative Header Background */}
      <View style={[styles.headerBg, { backgroundColor: colors.primary }]} />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.onPrimary} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.onPrimary }]}>
                {i18n.t("welcome")}
              </Text>
              <Text style={[styles.title, { color: colors.onPrimary }]}>
                {i18n.t("appName")}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={() => router.push("/search")}
            >
              <Ionicons name="search" size={20} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>

          {/* Main Hero Card (Daily Dua) */}
          {dailyDua && (
            <ThemedCard style={[styles.heroCard, { backgroundColor: colors.card }]}>
                <View style={styles.heroHeader}>
                    <View style={[styles.heroIcon, { backgroundColor: colors.secondary + '20' }]}>
                         <Ionicons name="moon" size={20} color={colors.secondary} />
                    </View>
                    <Text style={[styles.heroTitle, { color: colors.secondary }]}>{i18n.t("dailyDua")}</Text>
                </View>
                <Text style={[styles.heroArabic, { color: colors.text }]}>{dailyDua.arabic}</Text>
                <TouchableOpacity
                    style={[styles.heroBtn, { backgroundColor: colors.primary }]}
                    onPress={() => dailyDua && router.push(`/dua/${dailyDua.id}`)}
                >
                    <Text style={styles.heroBtnText}>{i18n.t("readDua")}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </TouchableOpacity>
            </ThemedCard>
          )}

          {/* Quick Stats / Weather */}
          <WeatherWidget />

          {/* Primary Tools Grid */}
          <View style={styles.gridContainer}>
             <View style={styles.row}>
                <QuickAccessButton icon="time" label={i18n.t("prayerTimes")} route="/imsakiye" color={colors.primary} />
                <QuickAccessButton icon="book" label={i18n.t("quran")} route="/quran" color={colors.secondary} />
                <QuickAccessButton icon="compass" label={i18n.t("qibla")} route="/qibla" color={colors.success} />
                <QuickAccessButton icon="finger-print" label={i18n.t("tasbih")} route="/tasbih" color={colors.accent} />
             </View>
             <View style={styles.row}>
                <QuickAccessButton icon="people" label={i18n.t("community")} route="/community" color="#805AD5" />
                <QuickAccessButton icon="videocam" label={i18n.t("liveKaaba")} route="/live-kaaba" color="#E53E3E" />
                <QuickAccessButton icon="calculator" label={i18n.t("zekat")} route="/zekat" color="#319795" />
                <QuickAccessButton icon="calendar" label={i18n.t("hijriCalendar")} route="/hijri" color="#D69E2E" />
             </View>
          </View>

          {/* Expanded Features List */}
          <ThemedCard style={styles.expandedTools}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>
                  {i18n.t("tools")}
              </Text>

              <TouchableOpacity style={[styles.toolRow, { borderBottomColor: colors.border }]} onPress={() => router.push("/religious-days")}>
                  <View style={styles.toolIconCtx}><Ionicons name="star" size={20} color={colors.secondary} /></View>
                  <Text style={[styles.toolText, { color: colors.text }]}>{i18n.t("religiousDays")}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.icon} />
              </TouchableOpacity>

               <TouchableOpacity style={[styles.toolRow, { borderBottomColor: colors.border }]} onPress={() => router.push("/esmaulhusna")}>
                  <View style={styles.toolIconCtx}><Ionicons name="list" size={20} color={colors.primary} /></View>
                  <Text style={[styles.toolText, { color: colors.text }]}>{i18n.t("esmaulhusna")}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.icon} />
              </TouchableOpacity>

               <TouchableOpacity style={[styles.toolRow, { borderBottomColor: colors.border }]} onPress={() => router.push("/tracker")}>
                  <View style={styles.toolIconCtx}><Ionicons name="checkbox" size={20} color={colors.success} /></View>
                  <Text style={[styles.toolText, { color: colors.text }]}>Amel Defteri</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.icon} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.toolRow, { borderBottomColor: colors.border }]} onPress={() => router.push("/library")}>
                  <View style={styles.toolIconCtx}><Ionicons name="library" size={20} color={colors.accent} /></View>
                  <Text style={[styles.toolText, { color: colors.text }]}>Kütüphane</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.icon} />
              </TouchableOpacity>

               <TouchableOpacity style={[styles.toolRow, { borderBottomColor: colors.border }]} onPress={() => router.push("/radio")}>
                  <View style={styles.toolIconCtx}><Ionicons name="radio" size={20} color="#DD6B20" /></View>
                  <Text style={[styles.toolText, { color: colors.text }]}>Kuran Radyo</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.icon} />
              </TouchableOpacity>

              {/* New Features */}
              <TouchableOpacity style={[styles.toolRow, { borderBottomColor: colors.border }]} onPress={() => router.push("/in-prayer")}>
                  <View style={styles.toolIconCtx}><Ionicons name="chatbubble-ellipses" size={20} color="#3182CE" /></View>
                  <Text style={[styles.toolText, { color: colors.text }]}>Namazdayım (Oto-SMS)</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.icon} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.toolRow, { borderBottomColor: colors.border }]} onPress={() => router.push("/multimedia")}>
                  <View style={styles.toolIconCtx}><Ionicons name="images" size={20} color="#D53F8C" /></View>
                  <Text style={[styles.toolText, { color: colors.text }]}>Multimedya</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.icon} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.toolRow, { borderBottomColor: 'transparent' }]} onPress={() => router.push("/agenda")}>
                  <View style={styles.toolIconCtx}><Ionicons name="calendar-number" size={20} color="#38A169" /></View>
                  <Text style={[styles.toolText, { color: colors.text }]}>Ajanda</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.icon} />
              </TouchableOpacity>
          </ThemedCard>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBg: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 250,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
  },
  safeArea: {
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
    marginBottom: 20,
    marginTop: 10,
  },
  greeting: {
    fontSize: 14,
    opacity: 0.9,
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
  heroCard: {
      marginBottom: 20,
  },
  heroHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
  },
  heroIcon: {
      padding: 6,
      borderRadius: 8,
  },
  heroTitle: {
      fontSize: 14,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
  },
  heroArabic: {
      fontSize: 22,
      lineHeight: 36,
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: 10,
  },
  heroBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 12,
      marginTop: 10,
      gap: 8,
  },
  heroBtnText: {
      color: '#FFF',
      fontWeight: '600',
  },
  gridContainer: {
      gap: 12,
      marginBottom: 20,
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
  },
  quickAccessBtn: {
      flex: 1,
      padding: 12,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
  },
  quickAccessIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
  },
  quickAccessLabel: {
      fontSize: 11,
      fontWeight: '600',
  },
  expandedTools: {
      marginBottom: 24,
      padding: 0,
      overflow: 'hidden',
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
    fontSize: 18,
    fontWeight: "700",
    padding: 16,
    paddingBottom: 0,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "500",
  },
  toolRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toolIconCtx: {
      width: 32,
      alignItems: 'center',
      marginRight: 12,
  },
  toolText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
  },
});
