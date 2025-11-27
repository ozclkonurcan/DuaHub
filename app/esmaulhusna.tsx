import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { esmaulHusna } from "../data/esmaulhusna";
import i18n from "../utils/i18n";

export default function EsmaulHusnaScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.numberBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.numberText}>{item.id}</Text>
        </View>
        <Text style={[styles.arabicText, { color: colors.primary }]}>
          {item.arabic}
        </Text>
      </View>
      <Text style={[styles.nameText, { color: colors.text }]}>{item.name}</Text>
      <Text style={[styles.meaningText, { color: colors.icon }]}>
        {item.meaning}
      </Text>
      <View style={[styles.benefitContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.benefitText, { color: colors.text }]}>
          {item.benefit}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {i18n.t("esmaulhusna")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={esmaulHusna}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  numberBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  arabicText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  meaningText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  benefitContainer: {
    padding: 10,
    borderRadius: 8,
  },
  benefitText: {
    fontSize: 13,
    fontStyle: "italic",
  },
});
