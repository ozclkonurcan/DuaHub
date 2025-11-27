import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import i18n from "../utils/i18n";

export default function ZekatScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [assets, setAssets] = useState({
    gold: "",
    cash: "",
    receivables: "",
    debts: "",
    goldPrice: "3500", // Default example price
  });

  const [result, setResult] = useState<{
    total: number;
    zakat: number;
    isEligible: boolean;
    nisabValue: number;
  } | null>(null);

  const calculateZakat = () => {
    Keyboard.dismiss();

    const goldVal = parseFloat(assets.gold) || 0;
    const cashVal = parseFloat(assets.cash) || 0;
    const recvVal = parseFloat(assets.receivables) || 0;
    const debtVal = parseFloat(assets.debts) || 0;
    const goldPriceVal = parseFloat(assets.goldPrice) || 0;

    const totalAssets = goldVal + cashVal + recvVal - debtVal;

    // Nisab calculation
    const NISAB_GRAMS = 80.18;
    const NISAB_VALUE = NISAB_GRAMS * goldPriceVal;

    const zakatAmount = totalAssets >= NISAB_VALUE ? totalAssets * 0.025 : 0;

    setResult({
      total: totalAssets,
      zakat: zakatAmount,
      isEligible: totalAssets >= NISAB_VALUE,
      nisabValue: NISAB_VALUE,
    });
  };

  const handleReset = () => {
    setAssets({
      gold: "",
      cash: "",
      receivables: "",
      debts: "",
      goldPrice: "3500",
    });
    setResult(null);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            {i18n.t("zekat")}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {i18n.t("assets")}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {i18n.t("goldPrice")} ({i18n.t("currency")})
              </Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.icon}
                value={assets.goldPrice}
                onChangeText={(t) => setAssets({ ...assets, goldPrice: t })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {i18n.t("gold")} ({i18n.t("currency")})
              </Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.icon}
                value={assets.gold}
                onChangeText={(t) => setAssets({ ...assets, gold: t })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {i18n.t("cash")} ({i18n.t("currency")})
              </Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.icon}
                value={assets.cash}
                onChangeText={(t) => setAssets({ ...assets, cash: t })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {i18n.t("receivables")} ({i18n.t("currency")})
              </Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.icon}
                value={assets.receivables}
                onChangeText={(t) => setAssets({ ...assets, receivables: t })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.error }]}>
                {i18n.t("debts")} ({i18n.t("currency")})
              </Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.icon}
                value={assets.debts}
                onChangeText={(t) => setAssets({ ...assets, debts: t })}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.resetButton, { borderColor: colors.error }]}
                onPress={handleReset}
              >
                <Text style={{ color: colors.error }}>{i18n.t("reset")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.calcButton, { backgroundColor: colors.primary }]}
                onPress={calculateZakat}
              >
                <Text style={styles.calcButtonText}>{i18n.t("calculate")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {result && (
            <View style={[styles.resultCard, { backgroundColor: result.isEligible ? colors.success + '20' : colors.card }]}>
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.text }]}>
                  {i18n.t("totalAssets")}:
                </Text>
                <Text style={[styles.resultValue, { color: colors.text }]}>
                  {result.total.toFixed(2)} {i18n.t("currency")}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.text }]}>
                  {i18n.t("zakatAmount")}:
                </Text>
                <Text style={[styles.resultValueBig, { color: result.zakat > 0 ? colors.primary : colors.text }]}>
                  {result.zakat.toFixed(2)} {i18n.t("currency")}
                </Text>
              </View>

              {!result.isEligible && (
                <Text style={[styles.note, { color: colors.icon }]}>
                  * {i18n.t("nisab")}: {result.nisabValue.toFixed(2)} {i18n.t("currency")} altındadır.
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    paddingTop: 8,
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
  scrollContent: {
    padding: 16,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  resetButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  calcButton: {
    flex: 2,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  calcButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resultCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 16,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  resultValueBig: {
    fontSize: 24,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 12,
  },
  note: {
    fontSize: 12,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
