import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import * as PrayerTimesService from "../services/prayerTimesService";

// Helper to get dates for the next 30 days
const getNext30Days = () => {
  const days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};

export default function ImsakiyeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [locationName, setLocationName] = useState("Konum alınıyor...");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Konum izni gerekli.");
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      // Reverse geocode to get city name (optional, skipping for speed)
      setLocationName("Mevcut Konum");

      // Fetch for next 30 days (mocking strictly for MVP or fetching one by one)
      // Since our service fetches ONE day, we might need to update the service or just fetch today + few days
      // For this MVP, we will fetch today and simulate the rest or fetch a few

      // Ideally, the API supports monthly. Aladhan supports monthly.
      // Let's modify the service or fetch a batch.
      // For safety, let's just fetch Today and replicate logic or loop.
      // Aladhan API: /v1/calendar?latitude=...&longitude=...&method=13&month=...&year=...

      const today = new Date();
      const res = await PrayerTimesService.getPrayerTimesCalendar(
          location.coords.latitude,
          location.coords.longitude,
          today.getMonth() + 1,
          today.getFullYear()
      );

      if (res) {
          setData(res);
      }
    } catch (e) {
      console.error(e);
      alert("Veri alınamadı");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isToday = index === new Date().getDate() - 1; // Approximate check

    return (
      <View style={[
        styles.row,
        { backgroundColor: isToday ? colors.primary + "20" : colors.card, borderColor: colors.border }
      ]}>
        <View style={styles.dateCol}>
            <Text style={[styles.dayText, { color: colors.text }]}>{item.date.gregorian.day} {item.date.gregorian.month.en}</Text>
            <Text style={[styles.hijriText, { color: colors.icon }]}>{item.date.hijri.day} {item.date.hijri.month.en}</Text>
        </View>
        <View style={styles.timeCol}><Text style={[styles.timeText, { color: colors.text }]}>{item.timings.Fajr.split(" ")[0]}</Text></View>
        <View style={styles.timeCol}><Text style={[styles.timeText, { color: colors.text }]}>{item.timings.Dhuhr.split(" ")[0]}</Text></View>
        <View style={styles.timeCol}><Text style={[styles.timeText, { color: colors.text }]}>{item.timings.Asr.split(" ")[0]}</Text></View>
        <View style={styles.timeCol}><Text style={[styles.timeText, { color: colors.text }]}>{item.timings.Maghrib.split(" ")[0]}</Text></View>
        <View style={styles.timeCol}><Text style={[styles.timeText, { color: colors.text }]}>{item.timings.Isha.split(" ")[0]}</Text></View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
             <Text style={[styles.headerTitle, { color: colors.text }]}>Ramazan İmsakiyesi</Text>
             <Text style={[styles.subTitle, { color: colors.icon }]}>{locationName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Table Header */}
      <View style={[styles.tableHeader, { backgroundColor: colors.primary }]}>
        <View style={styles.dateCol}><Text style={styles.headerText}>Tarih</Text></View>
        <View style={styles.timeCol}><Text style={styles.headerText}>İmsak</Text></View>
        <View style={styles.timeCol}><Text style={styles.headerText}>Öğle</Text></View>
        <View style={styles.timeCol}><Text style={styles.headerText}>İkindi</Text></View>
        <View style={styles.timeCol}><Text style={styles.headerText}>İftar</Text></View>
        <View style={styles.timeCol}><Text style={styles.headerText}>Yatsı</Text></View>
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  subTitle: { fontSize: 12, textAlign: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingBottom: 20 },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerText: { color: "#FFFFFF", fontSize: 12, fontWeight: "bold", textAlign: "center" },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  dateCol: { flex: 2 },
  timeCol: { flex: 1 },
  dayText: { fontSize: 12, fontWeight: "600" },
  hijriText: { fontSize: 10 },
  timeText: { fontSize: 12, textAlign: "center" },
});
