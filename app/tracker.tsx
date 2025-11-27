import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Modal,
  TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import i18n from "../utils/i18n";
import { ThemedButton } from "../components/ThemedButton";

type Tab = "tracker" | "missed";

export default function TrackerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [activeTab, setActiveTab] = useState<Tab>("tracker");

  // State for Daily Checklist (Amel Defteri)
  const [dailyDeeds, setDailyDeeds] = useState<{ [key: string]: boolean }>({
    quran: false,
    dhikr: false,
    charity: false,
    prayer5times: false,
    reading: false,
  });

  // State for Missed Prayers (Kaza Takibi)
  const [missedPrayers, setMissedPrayers] = useState<{ [key: string]: number }>({
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    witr: 0,
  });

  // Calculator Modal State
  const [calcModalVisible, setCalcModalVisible] = useState(false);
  const [age, setAge] = useState("");
  const [pubertyAge, setPubertyAge] = useState("12");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [dailyDeeds, missedPrayers]);

  const loadData = async () => {
    try {
      const deeds = await AsyncStorage.getItem("dailyDeeds");
      const missed = await AsyncStorage.getItem("missedPrayers");
      if (deeds) setDailyDeeds(JSON.parse(deeds));
      if (missed) setMissedPrayers(JSON.parse(missed));
    } catch (e) {
      console.error(e);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("dailyDeeds", JSON.stringify(dailyDeeds));
      await AsyncStorage.setItem("missedPrayers", JSON.stringify(missedPrayers));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDeed = (key: string) => {
    setDailyDeeds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateMissed = (key: string, delta: number) => {
    setMissedPrayers((prev) => {
      const newVal = Math.max(0, (prev[key] || 0) + delta);
      return { ...prev, [key]: newVal };
    });
  };

  const calculateMissed = () => {
      const currentAge = parseInt(age);
      const startAge = parseInt(pubertyAge);

      if (isNaN(currentAge) || isNaN(startAge) || currentAge <= startAge) {
          Alert.alert("Hata", "Lütfen geçerli yaş bilgileri giriniz.");
          return;
      }

      const yearsMissed = currentAge - startAge;
      // Approx days missed = years * 365 (ignoring leap years for simplicity in MVP)
      const daysMissed = yearsMissed * 365;

      const newMissed = {
          fajr: daysMissed,
          dhuhr: daysMissed,
          asr: daysMissed,
          maghrib: daysMissed,
          isha: daysMissed,
          witr: daysMissed,
      };

      Alert.alert(
          "Hesaplama Sonucu",
          `${yearsMissed} yıllık kaza namazı hesaplandı (${daysMissed} gün). Mevcut kaza borcunuza eklensin mi?`,
          [
              { text: "İptal", style: "cancel" },
              { text: "Ekle (Üzerine Yaz)", style: "destructive", onPress: () => {
                  setMissedPrayers(newMissed);
                  setCalcModalVisible(false);
              }}
          ]
      );
  };

  const renderTracker = () => (
    <View style={styles.content}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Günlük Amellerim</Text>

      {[
        { key: "prayer5times", label: "5 Vakit Namaz", icon: "body" },
        { key: "quran", label: "Kuran Okuma", icon: "book" },
        { key: "dhikr", label: "Günlük Zikirler", icon: "finger-print" },
        { key: "charity", label: "Sadaka / İyilik", icon: "heart" },
        { key: "reading", label: "Kitap Okuma", icon: "library" },
      ].map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[
            styles.deedItem,
            { backgroundColor: colors.card },
            dailyDeeds[item.key] && { borderColor: colors.primary, borderWidth: 1 }
          ]}
          onPress={() => toggleDeed(item.key)}
        >
          <View style={styles.deedLeft}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + "20" }]}>
              <Ionicons name={item.icon as any} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.deedText, { color: colors.text }]}>{item.label}</Text>
          </View>
          <Ionicons
            name={dailyDeeds[item.key] ? "checkbox" : "square-outline"}
            size={24}
            color={dailyDeeds[item.key] ? colors.primary : colors.icon}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMissed = () => (
    <View style={styles.content}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Kaza Namazlarım</Text>
          <TouchableOpacity onPress={() => setCalcModalVisible(true)}>
              <Text style={{color: colors.primary, fontWeight: 'bold'}}>Hesaplayıcı 🪄</Text>
          </TouchableOpacity>
      </View>

      {[
        { key: "fajr", label: i18n.t("fajr") },
        { key: "dhuhr", label: i18n.t("dhuhr") },
        { key: "asr", label: i18n.t("asr") },
        { key: "maghrib", label: i18n.t("maghrib") },
        { key: "isha", label: i18n.t("isha") },
        { key: "witr", label: "Vitir" },
      ].map((item) => (
        <View key={item.key} style={[styles.missedItem, { backgroundColor: colors.card }]}>
          <Text style={[styles.missedLabel, { color: colors.text }]}>{item.label}</Text>

          <View style={styles.counterControls}>
            <TouchableOpacity
              style={[styles.counterBtn, { backgroundColor: colors.error + "20" }]}
              onPress={() => updateMissed(item.key, -1)}
            >
              <Ionicons name="remove" size={20} color={colors.error} />
            </TouchableOpacity>

            <Text style={[styles.countText, { color: colors.text }]}>
              {missedPrayers[item.key] || 0}
            </Text>

            <TouchableOpacity
              style={[styles.counterBtn, { backgroundColor: colors.success + "20" }]}
              onPress={() => updateMissed(item.key, 1)}
            >
              <Ionicons name="add" size={20} color={colors.success} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Takip & Çetele</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "tracker" && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab("tracker")}
        >
          <Text style={[styles.tabText, { color: activeTab === "tracker" ? colors.primary : colors.icon }]}>
            Amel Defteri
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "missed" && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab("missed")}
        >
          <Text style={[styles.tabText, { color: activeTab === "missed" ? colors.primary : colors.icon }]}>
            Kaza Takibi
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === "tracker" ? renderTracker() : renderMissed()}
      </ScrollView>

      {/* Calc Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={calcModalVisible}
        onRequestClose={() => setCalcModalVisible(false)}
      >
          <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Kaza Hesaplayıcı</Text>
                  <Text style={{ color: colors.icon, marginBottom: 16 }}>
                      Tahmini kaza borcunuzu hesaplamak için yaş bilgilerinizi giriniz.
                  </Text>

                  <Text style={[styles.label, { color: colors.text }]}>Şu anki Yaşınız:</Text>
                  <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                      keyboardType="numeric"
                      value={age}
                      onChangeText={setAge}
                      placeholder="Örn: 30"
                  />

                  <Text style={[styles.label, { color: colors.text }]}>Ergenlik/Başlangıç Yaşı:</Text>
                  <TextInput
                      style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                      keyboardType="numeric"
                      value={pubertyAge}
                      onChangeText={setPubertyAge}
                      placeholder="Örn: 12"
                  />

                  <View style={styles.modalActions}>
                      <ThemedButton title="İptal" variant="ghost" onPress={() => setCalcModalVisible(false)} />
                      <ThemedButton title="Hesapla" onPress={calculateMissed} />
                  </View>
              </View>
          </View>
      </Modal>

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
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: { fontSize: 16, fontWeight: "500" },
  scrollContent: { padding: 16 },
  content: { gap: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  deedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  deedLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  deedText: { fontSize: 16, fontWeight: "500" },
  missedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  missedLabel: { fontSize: 16, fontWeight: "500" },
  counterControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  counterBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  countText: { fontSize: 18, fontWeight: "600", minWidth: 30, textAlign: "center" },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 20,
  },
  modalContent: {
      padding: 20,
      borderRadius: 16,
      gap: 12,
  },
  modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
  },
  label: {
      fontSize: 14,
      fontWeight: '600',
  },
  input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
  },
  modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 8,
  }
});
