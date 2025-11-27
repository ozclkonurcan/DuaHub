import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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

  // Converter State (Mock)
  const [gregorianDate, setGregorianDate] = React.useState("26.06.2025");
  const [convertedHijri, setConvertedHijri] = React.useState("1 Muharrem 1447");

  // Simple mock data for today
  const today = {
    hijri: "1 Muharrem 1447",
    gregorian: "26 Haziran 2025",
    day: "Perşembe"
  };

  const handleConvert = () => {
      // Mock conversion logic
      // In real app, use 'hijri-converter' package
      setConvertedHijri("1 Muharrem 1447");
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
          <Text style={[styles.hijriText, { color: colors.primary }]}>{today.hijri}</Text>
          <Text style={[styles.gregorianText, { color: colors.text }]}>{today.gregorian}</Text>
          <Text style={[styles.dayText, { color: colors.icon }]}>{today.day}</Text>
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
                     <Text style={[styles.resultText, { color: colors.primary }]}>{convertedHijri}</Text>
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
  },
  resultText: {
      fontSize: 18,
      fontWeight: 'bold',
  },
  centerIcon: {
      alignItems: 'center',
  }
});
