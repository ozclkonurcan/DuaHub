import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

export default function MosquesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Hata", "Konum izni verilmedi");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const openMaps = () => {
    if (!location) {
      Alert.alert("Bekleyiniz", "Konum alınıyor...");
      return;
    }

    const { latitude, longitude } = location.coords;
    const query = "camiler";
    const label = "Yakın Camiler";

    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${query}&ll=${latitude},${longitude}&z=14`,
      android: `geo:${latitude},${longitude}?q=${query}&z=14`
    });

    if (url) {
        Linking.openURL(url);
    }
  };

  const openQiblaMap = () => {
      // Open a web tool for Qibla Map visualization as an alternative to native map
      WebBrowser.openBrowserAsync("https://qiblafinder.withgoogle.com/");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Haritalar</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Ionicons name="map" size={48} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Yakın Camiler</Text>
          <Text style={[styles.cardDesc, { color: colors.icon }]}>
            Bulunduğunuz konuma en yakın camileri harita uygulamasında gösterir.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={openMaps}
          >
            <Text style={styles.buttonText}>Haritada Göster</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Ionicons name="compass" size={48} color={colors.accent} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Harita Üzerinden Kıble</Text>
          <Text style={[styles.cardDesc, { color: colors.icon }]}>
            Uydu görüntüsü üzerinden Kabe hattını görerek kıbleyi bulun.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={openQiblaMap}
          >
            <Text style={styles.buttonText}>Google Kıble Bulucu'yu Aç</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  content: { padding: 16, gap: 20 },
  card: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 20, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  cardDesc: { textAlign: "center", marginBottom: 20, lineHeight: 22 },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
