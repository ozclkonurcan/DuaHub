import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import i18n from "../../utils/i18n";

export default function QuranIndexScreen() {
  const { colors } = useTheme();

  // Mock list of Surahs
  const surahs = Array.from({ length: 114 }, (_, i) => ({
    id: i + 1,
    name: `Sure ${i + 1}`,
    arabicName: "سورة",
    verseCount: 7, // Mock
    englishName: "Surah Name"
  }));

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.surahCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
      onPress={() => router.push(`/quran/${item.id}`)}
    >
        <View style={styles.numberContainer}>
            <Text style={[styles.number, { color: colors.text }]}>{item.id}</Text>
        </View>
        <View style={styles.infoContainer}>
            <Text style={[styles.surahName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.verseCount, { color: colors.icon }]}>{item.verseCount} Ayet</Text>
        </View>
        <View style={styles.arabicContainer}>
             <Text style={[styles.arabicName, { color: colors.primary }]}>{item.arabicName}</Text>
        </View>
    </TouchableOpacity>
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
          {i18n.t("quran")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={surahs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
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
  listContent: {
      paddingBottom: 20,
  },
  surahCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
  },
  numberContainer: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  number: {
      fontSize: 14,
      fontWeight: 'bold',
  },
  infoContainer: {
      flex: 1,
  },
  surahName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
  },
  verseCount: {
      fontSize: 12,
  },
  arabicContainer: {
      alignItems: 'flex-end',
  },
  arabicName: {
      fontSize: 20,
      fontWeight: 'bold',
      fontFamily: 'System', // Or a specific Arabic font if loaded
  }
});
