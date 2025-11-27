import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import i18n from "../utils/i18n";

export default function HijriCalendarScreen() {
  const { colors } = useTheme();

  // Simple mock data for today
  const today = {
    hijri: "1 Muharrem 1447",
    gregorian: "26 Haziran 2025",
    day: "Perşembe"
  };

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
          {i18n.t("hijriCalendar")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.calendarCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.hijriText, { color: colors.primary }]}>{today.hijri}</Text>
          <Text style={[styles.gregorianText, { color: colors.text }]}>{today.gregorian}</Text>
          <Text style={[styles.dayText, { color: colors.icon }]}>{today.day}</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
                Hicri takvim ayın hareketlerine göre belirlendiği için 1-2 gün fark edebilir.
            </Text>
        </View>

        {/* Converter Placeholder */}
        <View style={[styles.converterContainer, { backgroundColor: colors.card }]}>
             <Text style={[styles.sectionTitle, { color: colors.text }]}>Takvim Çevirici</Text>
             <TouchableOpacity style={[styles.convertButton, { backgroundColor: colors.primary }]}>
                 <Text style={styles.buttonText}>Miladi ➡️ Hicri</Text>
             </TouchableOpacity>
        </View>
      </View>
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
    padding: 20,
    gap: 20,
    alignItems: 'center',
  },
  calendarCard: {
    width: '100%',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hijriText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gregorianText: {
    fontSize: 20,
    fontWeight: '500',
  },
  dayText: {
    fontSize: 18,
  },
  infoCard: {
      flexDirection: 'row',
      padding: 16,
      borderRadius: 12,
      gap: 12,
      alignItems: 'center',
  },
  infoText: {
      flex: 1,
      fontSize: 14,
  },
  converterContainer: {
      width: '100%',
      padding: 20,
      borderRadius: 16,
      gap: 16,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
  },
  convertButton: {
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
  },
  buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
  }
});
