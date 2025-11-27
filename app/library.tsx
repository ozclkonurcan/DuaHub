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

const BOOKS = [
  { id: "1", title: "Kur'an-ı Kerim", subtitle: "Arapça & Meal", icon: "book" },
  { id: "2", title: "Cevşen-ül Kebir", subtitle: "Büyük Dua Zırhı", icon: "shield" },
  { id: "3", title: "Tesbihatlar", subtitle: "Namaz Sonrası Tesbihatlar", icon: "list" },
  { id: "4", title: "Aşr-ı Şerifler", subtitle: "Meşhur Aşırlar", icon: "mic" },
  { id: "5", title: "Namaz Hocası", subtitle: "Resimli Anlatım", icon: "body" },
  { id: "6", title: "Oruç Rehberi", subtitle: "Ramazan ve Oruç", icon: "moon" },
  { id: "7", title: "Hac & Umre", subtitle: "Kutsal Yolculuk Rehberi", icon: "airplane" },
  { id: "8", title: "40 Hadis", subtitle: "İmam Nevevi", icon: "text" },
];

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.bookCard, { backgroundColor: colors.card }]}
      onPress={() => {
        // In a real app, this would navigate to a reader screen or open a PDF
        // For this demo, we just show an alert or placeholder
        // router.push(`/library/${item.id}`);
        alert("Bu kitap içeriği yakında eklenecek.");
      }}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
        <Ionicons name={item.icon as any} size={28} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.bookTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.bookSubtitle, { color: colors.icon }]}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.icon} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kütüphane</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={BOOKS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: { padding: 16 },
  bookCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: { flex: 1 },
  bookTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  bookSubtitle: { fontSize: 13 },
});
