import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import i18n from "../utils/i18n";
import { ThemedCard } from "../components/ThemedCard";
import * as PrayerTimesService from "../services/prayerTimesService";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PrayerTime {
  name: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function ImsakiyeScreen() {
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [city, setCity] = useState("Konum alınıyor...");
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadSettingsAndFetch();
  }, []);

  const loadSettingsAndFetch = async () => {
      try {
          const storedCity = await AsyncStorage.getItem("user_manual_city");
          if (storedCity) {
              setIsManualMode(true);
              setManualCity(storedCity);
              fetchManualTimes(storedCity);
          } else {
              setIsManualMode(false);
              fetchLocationAndTimes();
          }
      } catch (e) {
          fetchLocationAndTimes();
      }
  };

  const fetchLocationAndTimes = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCity("Konum İzni Yok");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Mock reverse geocode
      setCity("Mevcut Konum");

      const times = await PrayerTimesService.getPrayerTimes(latitude, longitude);
      if (times) {
        setPrayerTimes(formatTimes(times));
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setCity("Hata");
      setLoading(false);
    }
  };

  const fetchManualTimes = async (cityName: string) => {
      setLoading(true);
      setCity(cityName);
      // In a real app, we would Geocode the city name to coords here
      // For now, we use a mock/default coord (Istanbul) to show data
      try {
          // Mock Coords for Istanbul
          const lat = 41.0082;
          const lng = 28.9784;
          const times = await PrayerTimesService.getPrayerTimes(lat, lng);
          if (times) setPrayerTimes(formatTimes(times));
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const formatTimes = (data: any): PrayerTime[] => {
    const timings = data.timings;
    return [
      { name: i18n.t("fajr"), time: timings.Fajr, icon: "sunny-outline" },
      { name: "Güneş", time: timings.Sunrise, icon: "sunny" },
      { name: i18n.t("dhuhr"), time: timings.Dhuhr, icon: "sunny" },
      { name: i18n.t("asr"), time: timings.Asr, icon: "partly-sunny" },
      { name: i18n.t("maghrib"), time: timings.Maghrib, icon: "moon-outline" },
      { name: i18n.t("isha"), time: timings.Isha, icon: "moon" },
    ];
  };

  const saveManualCity = async () => {
      if (manualCity.trim().length > 0) {
          await AsyncStorage.setItem("user_manual_city", manualCity);
          setIsManualMode(true);
          setModalVisible(false);
          fetchManualTimes(manualCity);
      }
  };

  const switchToGPS = async () => {
      await AsyncStorage.removeItem("user_manual_city");
      setIsManualMode(false);
      setModalVisible(false);
      fetchLocationAndTimes();
  };

  const renderItem = ({ item }: { item: PrayerTime }) => (
    <ThemedCard style={styles.prayerCard}>
      <View style={styles.prayerInfo}>
        <Ionicons name={item.icon} size={24} color={colors.primary} />
        <Text style={[styles.prayerName, { color: colors.text }]}>
          {item.name}
        </Text>
      </View>
      <Text style={[styles.prayerTime, { color: colors.text }]}>{item.time}</Text>
    </ThemedCard>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {i18n.t("prayerTimes")}
        </Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="location" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.locationContainer}>
          <Text style={[styles.dateText, { color: colors.text }]}>
              {new Date().toLocaleDateString("tr-TR", { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <View style={[styles.locationBadge, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name={isManualMode ? "map" : "navigate"} size={16} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.primary }]}>{city}</Text>
          </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            {i18n.t("loading")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={prayerTimes}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* City Selection Modal */}
      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
      >
          <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Şehir Seçimi</Text>

                  <Text style={[styles.label, { color: colors.text }]}>Şehir Adı Giriniz:</Text>
                  <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                      placeholder="Örn: Ankara"
                      placeholderTextColor={colors.icon}
                      value={manualCity}
                      onChangeText={setManualCity}
                  />

                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={saveManualCity}>
                      <Text style={styles.btnText}>Kaydet ve Ara</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.success, marginTop: 10 }]} onPress={switchToGPS}>
                      <Ionicons name="navigate" size={16} color="#FFF" style={{marginRight: 8}} />
                      <Text style={styles.btnText}>GPS Konumumu Kullan</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.closeBtn]} onPress={() => setModalVisible(false)}>
                      <Text style={{ color: colors.icon }}>Kapat</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  locationContainer: {
      padding: 16,
      alignItems: 'center',
      gap: 8,
  },
  dateText: {
      fontSize: 16,
      fontWeight: '500',
  },
  locationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 6,
  },
  locationText: {
      fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  prayerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  prayerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: "500",
  },
  prayerTime: {
    fontSize: 20,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 20,
  },
  modalContent: {
      padding: 20,
      borderRadius: 16,
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
  },
  label: {
      marginBottom: 8,
  },
  input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
  },
  modalBtn: {
      padding: 14,
      borderRadius: 12,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
  },
  btnText: {
      color: '#FFF',
      fontWeight: 'bold',
  },
  closeBtn: {
      marginTop: 16,
      alignItems: 'center',
      padding: 10,
  }
});
