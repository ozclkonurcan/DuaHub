import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import i18n from "../utils/i18n";
import { ThemedButton } from "../components/ThemedButton";
import { ThemedCard } from "../components/ThemedCard";

export default function HijriCalendarScreen() {
  const { colors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Converter State (Mock)
  const [gregorianDate, setGregorianDate] = useState("");
  const [convertedHijri, setConvertedHijri] = useState("");

  useEffect(() => {
    // Initialize
    setCurrentDate(new Date());
    setGregorianDate(new Date().toLocaleDateString("tr-TR"));
  }, []);

  const getHijriDateString = (date: Date) => {
    // Rough calc for demo
    // TODO: Use actual library
    const hijriMonths = ["Muharrem", "Safer", "Rebiülevvel", "Rebiülahir", "Cemaziyelevvel", "Cemaziyelahir", "Recep", "Şaban", "Ramazan", "Şevval", "Zilkade", "Zilhicce"];
    return `${date.getDate()} ${hijriMonths[date.getMonth()]} 1447`;
  };

  const handleConvert = () => {
      // Mock logic: just repeats input for now but demonstrates interaction
      setConvertedHijri(getHijriDateString(new Date()));
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

      <ScrollView contentContainerStyle={styles.content}>
        <ThemedCard style={styles.calendarCard}>
          <Text style={[styles.hijriText, { color: colors.primary }]}>
             {getHijriDateString(currentDate)}
          </Text>
          <Text style={[styles.gregorianText, { color: colors.text }]}>
             {currentDate.toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
          <Text style={[styles.dayText, { color: colors.icon }]}>
             {currentDate.toLocaleDateString("tr-TR", { weekday: 'long' })}
          </Text>
        </ThemedCard>

        <View style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
                Hicri takvim ayın hareketlerine göre belirlendiği için 1-2 gün fark edebilir.
            </Text>
        </View>

        {/* Converter */}
        <ThemedCard style={styles.converterContainer}>
             <Text style={[styles.sectionTitle, { color: colors.text }]}>Takvim Çevirici</Text>

             <View style={styles.inputGroup}>
                 <Text style={[styles.label, { color: colors.text }]}>Miladi Tarih</Text>
                 <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    value={gregorianDate}
                    onChangeText={setGregorianDate}
                    placeholder="GG.AA.YYYY"
                 />
             </View>

             <View style={styles.centerIcon}>
                 <Ionicons name="arrow-down-circle" size={32} color={colors.primary} />
             </View>

             <View style={styles.inputGroup}>
                 <Text style={[styles.label, { color: colors.text }]}>Hicri Tarih (Tahmini)</Text>
                 <View style={[styles.resultBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                     <Text style={[styles.resultText, { color: colors.primary }]}>
                        {convertedHijri || "Sonuç bekleniyor..."}
                     </Text>
                 </View>
             </View>

             <ThemedButton title="Çevir" onPress={handleConvert} style={{ marginTop: 16 }} />
        </ThemedCard>
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
    padding: 20,
    gap: 20,
  },
  calendarCard: {
    width: '100%',
    padding: 40,
    alignItems: 'center',
    gap: 10,
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
      gap: 16,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
  },
  inputGroup: {
      gap: 8,
  },
  label: {
      fontSize: 14,
      fontWeight: '500',
  },
  input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
  },
  resultBox: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      minHeight: 50,
      justifyContent: 'center',
  },
  resultText: {
      fontSize: 18,
      fontWeight: 'bold',
  },
  centerIcon: {
      alignItems: 'center',
  }
});
