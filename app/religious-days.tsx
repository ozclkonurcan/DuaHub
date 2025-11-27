import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import i18n from "../utils/i18n";

export default function ReligiousDaysScreen() {
  const { colors } = useTheme();

  // Mock data for religious days (2025 dates need to be dynamic in production)
  const days = [
    { title: "Regaip Kandili", date: "2 Ocak 2025", remaining: "Geçti" },
    { title: "Miraç Kandili", date: "26 Ocak 2025", remaining: "Geçti" },
    { title: "Berat Kandili", date: "13 Şubat 2025", remaining: "Geçti" },
    { title: "Ramazan Başlangıcı", date: "1 Mart 2025", remaining: "Geçti" },
    { title: "Kadir Gecesi", date: "26 Mart 2025", remaining: "Geçti" },
    { title: "Ramazan Bayramı", date: "30 Mart 2025", remaining: "Geçti" },
    { title: "Kurban Bayramı", date: "6 Haziran 2025", remaining: "3 Gün" },
    { title: "Hicri Yılbaşı", date: "26 Haziran 2025", remaining: "23 Gün" },
    { title: "Aşure Günü", date: "5 Temmuz 2025", remaining: "32 Gün" },
    { title: "Mevlid Kandili", date: "3 Eylül 2025", remaining: "92 Gün" },
  ];

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
          {i18n.t("religiousDays")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {days.map((day, index) => (
          <View
            key={index}
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            <View style={styles.cardLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="moon" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.dayTitle, { color: colors.text }]}>{day.title}</Text>
                <Text style={[styles.dayDate, { color: colors.icon }]}>{day.date}</Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
              <Text style={styles.badgeText}>{day.remaining}</Text>
            </View>
          </View>
        ))}
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
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  dayDate: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
